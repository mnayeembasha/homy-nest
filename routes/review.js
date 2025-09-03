const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../validateSchema.js");
const ExpressError = require("../utils/ExpressError.js");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
      let errorMessage = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errorMessage);
    } else {
      next();
    }
  };

//POST Route - Reviews
router.post('/', wrapAsync(reviewController.createReview)
  );

  //Delete Route - Review
router.delete('/:reviewId', wrapAsync(reviewController.destroyReview)
);

module.exports=router;