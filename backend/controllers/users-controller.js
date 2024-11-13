const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Ryan",
    email: "ryan@gmail.com",
    password: "Testing123",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const user = DUMMY_USERS.find(
    (u) => email === u.email && password === u.password
  );

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

const signup = (req, res, next) => {
  const { email, password, name } = req.body;

  const hasUser = DUMMY_USERS.find((u) => u.email === email);

  if (hasUser) {
    return next(new HttpError("Email address already taken.", 422));
  }

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  DUMMY_USERS.push(newUser);

  res.status(201).json({ user: newUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
