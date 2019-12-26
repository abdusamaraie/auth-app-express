var express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  localStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user");

mongoose.connect("mongodb://localhost:27017/auth_demo", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var app = express();

app.use(
  require("express-session")({
    secret: "this is top secret",
    resave: false,
    saveUninitialized: false
  })
);
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTES
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/dash", isLoggedIn, (req, res) => {
  res.render("dash");
});
//register
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.render("register");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/dash");
        });
      }
    }
  );
});
//login
app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dash",
    failureRedirect: "/login"
  }),
  (req, res) => {}
);

//logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//middleware to check if user is loggedin
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, function() {
  console.log("server is running");
});
