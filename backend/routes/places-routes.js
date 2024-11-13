const express = require("express");

const placesController = require("../controllers/places-controller.js");

const router = express.Router();

router.get("/:pid", placesController.getPlaceById);

router.delete("/:pid", placesController.deletePlace);

router.patch("/:pid", placesController.updatePlace);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.post("/", placesController.createPlace);

module.exports = router;
