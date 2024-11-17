const express = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places-controller.js");
const fileUpload = require("../middleware/file-upload.js");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/user/:uid", placesController.getPlacesByUserId);

router.get("/:pid", placesController.getPlaceById);

router.use(checkAuth);

router.delete("/:pid", placesController.deletePlace);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

module.exports = router;
