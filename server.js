if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  console.log("Using .env file in dev");
}

const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middleware/authentication");
const { verifyAccount } = require("./utils/accountVerification");
const { getTerritories } = require("./utils/territories");

const app = express();
const port = 5500;

app.set("view-engine", "ejs");

// Allows parsing of urlencoded payloads
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    // Note: Currently, I don't have to worry about non first-party context, so sameSite strict is fine
    cookie: { sameSite: "strict", maxAge: 60000 },
  })
);
app.use(flash());
app.use(cookieParser());

app.get("/", (request, response) => {
  response.redirect("/home/index");
});

app.get("/home/index", checkAuthenticated, async (request, response) => {
  let { data } = await getTerritories();

  response.render("index.ejs", { territories: data });
});

app.get("/account/login", checkNotAuthenticated, (request, response) => {
  const message = request.flash("login-message");
  response.render("login.ejs", { message });
});

app.post("/account/login", async (request, response) => {
  userObject = await verifyAccount(request);

  if (userObject) {
    // Create jwt token containing account information
    const userToken = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Attach cookie to response
    response.cookie("userToken", userToken);

    response.redirect("/home/index");
  } else {
    response.redirect("/account/login");
  }
});

// Setup server to listen for connections using specified port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
