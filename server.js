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

// Returns an object of territories
async function getTerritories() {
  // To be returned if API request is invalid
  // This is important, other parts of this app rely on the object with this structure.
  const emptyTerritoriesObject = { data: [] };

  let response;
  try {
    response = await fetch(
      "https://netzwelt-devtest.azurewebsites.net/Territories/All"
    );
  } catch (error) {
    console.error(error);
    return emptyTerritoriesObject;
  }

  // If invalid response, return empty object;
  if (!response.ok) {
    return emptyTerritoriesObject;
  }
  // If valid response, process it to return object of territories
  else {
    let territoriesObject;

    // It's possible for the API to give incorrect format, so surround this too.
    try {
      territoriesObject = await response.json();
    } catch (error) {
      console.error(error);
      return emptyTerritoriesObject;
    }

    return territoriesObject;
  }
}

// Returns user information if account credentials are valid; false otherwise
async function verifyAccount(request) {
  const { username, password } = request.body;

  let response;
  try {
    response = await fetch(
      "https://netzwelt-devtest.azurewebsites.net/Account/SignIn",
      {
        method: "post",
        body: JSON.stringify({ username: username, password: password }),
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    request.flash(
      "login-message",
      "Server error occurred. Please contact the administrator."
    );
    return;
  }

  // Asssumption 1: Any 200 message is valid, everything else invalid
  if (!response.ok) {
    console.error(
      "Error login info not valid:",
      response.status,
      response.statusText
    );
    request.flash("login-message", "Invalid username or password.");
    return false;
  }
  // If valid response, parse it to obtain and return user object
  else {
    // Will store parsed user information from response
    let userObject;

    try {
      userObject = await response.json();
    } catch (error) {
      console.error(
        "Error parsing user object:",
        response.status,
        response.statusText
      );

      request.flash(
        "login-message",
        "Server error occurred. Please contact the administrator"
      );
      return false;
    }

    request.flash("login-message", "Account is verified.");
    return userObject;
  }
}

// Setup server to listen for connections using specified port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
