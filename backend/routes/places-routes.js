const express = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places-controller.js");

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.delete("/:pid", placesController.deletePlace);

router.patch("/:pid", [
  check("title").not().isEmpty(),
  check("description").isLength({min: 5}),
],placesController.updatePlace);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

module.exports = router;
