const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controller");

const router = express.Router();

router.post(
  "/signup",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({min: 8}),
    check("name").not().isEmpty(),
  ],
  usersController.signup
);

router.post(
  "/login",
  [check("email").normalizeEmail().isEmail(), check("password").not().isEmpty()],
  usersController.login
);

router.get("/", usersController.getUsers);

module.exports = router;
