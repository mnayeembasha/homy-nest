const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../validateSchema.js");
const ExpressError = require("../utils/ExpressError.js");
const listingController = require("../controllers/listings.js");
const {isLoggedIn} = require('../middleware.js');

/* Middleware Validate Schema with Joi */
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

/*INDEX,CREATE Route*/
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,validateListing,wrapAsync(listingController.createListing))
;

/*New Route*/
router.get("/new",isLoggedIn,listingController.renderCreateListingForm);

/*Edit Route*/
router.get("/:id/edit", isLoggedIn,wrapAsync(listingController.renderEditForm));

/*SHOW,UPDATE,DELETE Routes */
router.route("/:id")
  .get(wrapAsync(listingController.showListings))
  .put(isLoggedIn,validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn,wrapAsync(listingController.destroyListing))
;

module.exports = router;
