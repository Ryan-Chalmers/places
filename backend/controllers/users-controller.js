const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
    user = await User.findOne({ email });
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

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid credentials.", 401);
    return next(error);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.WEB_TOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Log in failed, please try again.", 500));
  }

  res
    .status(200)
    .json({ userId: user.id, email: user.email, token });
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

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError("Sign up failed, please try again.", 500));
  }

  let token;

  console.log(process.env.WEB_TOKEN_KEY)

  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.WEB_TOKEN_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again.", 500));
  }

  res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
