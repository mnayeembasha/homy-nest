const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {  connectDB } = require("./init/index.js");
const {  PORT } = require("./config.js");

/* Connect to Mongoose */
connectDB()
  .then(() => {
    console.log("DB connection successfull");
  })
  .catch((err) => {
    console.log("Error while connecting to database", err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());


app.use(session({
  secret:"secretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    //Time after which sessionId cookie expires(7days-in ms)
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}));
app.use(flash());

//Authentication Middleware - (passport.js)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*Handle the Flash Messages */
app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  return next();
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",userRouter);

// Routes
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })

);

/* Handle Page Not Found Error */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

/*Handle Errors through Middleware */
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
  // res.status(statusCode).send(message);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
