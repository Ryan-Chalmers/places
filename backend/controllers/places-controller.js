const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, could not find places", 500)
    );
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description, address } = req.body;
  const creator = req.userData.userId;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(
      new HttpError("Creating place failed, user could not be found", 401)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place.", 401));
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.findByIdAndRemove(placeId, { session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    sess.commitTransaction();
  } catch (error) {
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Deleted place" });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError("Updating place failed, please try again.", 500));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 401));
  }

  try {
    place.title = title;
    place.description = description;
    await place.save();
  } catch (error) {
    return next(new HttpError("Updating place failed, please try again.", 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
