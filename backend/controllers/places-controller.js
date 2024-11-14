const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous skyscrapers in the world",
    address: "20 W 34th St., New York, NY 10001, United States",
    location: {
      lat: 40.7484405,
      lng: -73.9882393,
    },
    creator: "u1",
  },
];

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

  let userPlaces;

  try {
    userPlaces = await Place.find({ creator: userId });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong, could not find places", 500)
    );
  }

  if (!userPlaces || userPlaces.isEmpty) {
    return next(
      new HttpError("Could not find a place for the provided user id.", 404)
    );
  }

  res.json({
    places: userPlaces.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { title, description, address, creator } = req.body;

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
    image:
      "https://commons.wikimedia.org/wiki/File:003_Olive-bellied_Sunbird_in_flight_at_Kibale_forest_National_Park_Photo_by_Giles_Laurent.jpg",
    creator,
  });
  try {
    await createdPlace.save();
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findByIdAndDelete(placeId);
  } catch (error) {
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }

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
    place = await Place.findByIdAndUpdate(placeId, { title, description });
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
