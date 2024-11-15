const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Ryan",
    email: "ryan@gmail.com",
    password: "Testing123",
  },
];

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(
      new HttpError("Fetching users failed, please try again later", 500)
    );
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }

  const { email, password } = req.body;

  let user;

  try {
    user = await User.findOne({ email, password });
  } catch (error) {
    return next(new HttpError("Log in failed, please try again later", 500));
  }

  if (!user) {
    return next(
      new HttpError(
        "Could not find user matching the email and password provided",
        401
      )
    );
  }

  res.status(200).json({ message: "Logged in!" });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { email, password, name, image, places } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError("Sign up failed, please try again later", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead", 422)
    );
  }

  const newUser = new User({
    name,
    email,
    password,
    image:
      "https://commons.wikimedia.org/wiki/File:Jard%C3%ADn_del_Pr%C3%ADncipe,_Mahan,_Ir%C3%A1n,_2016-09-22,_DD_21.jpg",
    places,
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError("Sign up failed, please try again.", 500));
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
