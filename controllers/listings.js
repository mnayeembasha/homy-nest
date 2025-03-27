const Listing = require("../models/listing.js");

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderCreateListingForm = (req, res) => {
    res.render("listings/new.ejs");
  };

  module.exports.showListings = async (req, res) => {
    let { id } = req.params;
    const currentListing = await Listing.findById(id).populate("reviews");
    if(!currentListing){
      req.flash("error","Listing you requested does not exist");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing: currentListing });
  }

  module.exports.createListing=async (req, res, next) => {
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing created");
    res.redirect(`/listings/${newListing._id}`);
  };

  module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const currentListing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing: currentListing });
  };

  module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let updatedListing = await Listing.findByIdAndUpdate(id, {
      ...req.body.listing,
    });
    req.flash("success","Listing Updated Successfully!");
    res.redirect(`/listings/${updatedListing._id}`);
  };

  module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully");
    res.redirect("/listings");
  };