const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");

const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { connectDB } = require("./init/index.js");
const { PORT, SESSION_SECRET, NODE_ENV, MONGO_URL } = require("./config.js");


connectDB()
  .then(() => {
    console.log("✅ DB connection successful");
  })
  .catch((err) => {
    console.error("❌ Error while connecting to database:", err);
  });

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected! Reconnecting...");
  connectDB();
});

if (NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust Render's proxy
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

/* ✅ Secure Session Configuration with MongoDB */
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      touchAfter: 24 * 3600, // Reduces session updates
      crypto: { secret: SESSION_SECRET }, // Encrypt session data
    }),
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: NODE_ENV !== "development",
      sameSite: "lax",
    },
  })
);
app.use(flash());

/* Authentication Middleware - Passport */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* Handle Flash Messages */
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currentUser = req.user;
  return next();
});

/* Routes */
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRouter);

/* Home Route */
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

/* Handle 404 Errors */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

/* Global Error Handling Middleware */
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  if (NODE_ENV === "production") {
    message = "Internal Server Error"; // Hide sensitive error details
  }
  res.status(statusCode).render("error.ejs", { err: { message, statusCode } });
});

/* Start the Server */
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
