const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

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

  res.status(200).json({ message: "Logged in!", user: user.toObject({getters: true}) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }

  const { email, password, name } = req.body;
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
    image: req.file.path,
    places: [],
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
