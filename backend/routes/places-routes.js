const express = require("express");

const placesControllers =  require('../controllers/places-controller.js')

const router = express.Router();

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

module.exports = router;
