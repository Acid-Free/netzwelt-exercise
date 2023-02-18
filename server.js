if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const app = express();
const port = 5500;

let loggedIn = false;

app.set("view-engine", "ejs");

// allows parsing of urlencoded payloads
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);
app.use(flash());

app.get("/", (request, response) => {
  response.redirect("/home/index");
});

app.get("/home/index", checkAuthenticated, async (request, response) => {
  let { data } = await getTerritories();
  // TODO: replace after dev
  // let { data } = getDummyTerritories();
  response.render("index.ejs", { territories: data });
});

app.get("/account/login", checkNotAuthenticated, (request, response) => {
  const message = request.flash("login-message");
  response.render("login.ejs", { message });
});

app.post("/account/login", async (request, response) => {
  loggedIn = await verifyAccount(request);
  // TODO: replace after dev
  // loggedIn = verifyDummyAccount(request);

  if (loggedIn) {
    response.redirect("/home/index");
  } else {
    response.redirect("/account/login");
  }
});

// dev function serving the same function as getTerritories
function getDummyTerritories() {
  // return { data: [] };
  return {
    data: [
      { id: "1", name: "Metro Manila", parent: null },
      { id: "101", name: "Manila", parent: "1" },
      { id: "10101", name: "Malate", parent: "101" },
      { id: "10102", name: "Ermita", parent: "101" },
      { id: "10103", name: "Binondo", parent: "101" },
      { id: "102", name: "Makati", parent: "1" },
      { id: "10201", name: "Poblacion", parent: "102" },
      { id: "10202", name: "Bel-Air", parent: "102" },
      { id: "10203", name: "San Lorenzo", parent: "102" },
      { id: "10204", name: "Urdaneta", parent: "102" },
      { id: "103", name: "Marikina", parent: "1" },
      { id: "10301", name: "Sto Nino", parent: "103" },
      { id: "10302", name: "Malanday", parent: "103" },
      { id: "10303", name: "Concepcion I", parent: "103" },
      { id: "2", name: "CALABARZON", parent: null },
      { id: "201", name: "Laguna", parent: "2" },
      { id: "20101", name: "Calamba", parent: "201" },
      { id: "20102", name: "Sta. Rosa", parent: "201" },
      { id: "202", name: "Cavite", parent: "2" },
      { id: "20201", name: "Kawit", parent: "202" },
      { id: "203", name: "Batangas", parent: "2" },
      { id: "20301", name: "Lipa", parent: "203" },
      { id: "20302", name: "Tanauan", parent: "203" },
      { id: "3", name: "Central Luzon", parent: null },
      { id: "301", name: "Bulacan", parent: "3" },
      { id: "302", name: "Nueva Ecija", parent: "3" },
      { id: "303", name: "Tarlac", parent: "3" },
      { id: "304", name: "Pampanga", parent: "3" },
    ],
  };
}

// returns an object of territories
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

  if (!response.ok) {
    return emptyTerritoriesObject;
  } else {
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

// dev function serving same functionality as verifyAccount
function verifyDummyAccount(request) {
  return true;
}

// returns true if account credentials are valid; false otherwise
async function verifyAccount(request) {
  const username = request.body.username;
  const password = request.body.password;

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
    console.error("Error:", response.status, response.statusText);
    request.flash("login-message", "Invalid username or password.");
    return false;
  } else {
    request.flash("login-message", "Account is verified.");
    return true;
  }
}

// Checks if a user is logged in
function checkAuthenticated(request, response, next) {
  if (loggedIn) {
    return next();
  } else {
    return response.redirect("/account/login");
  }
}

// Checks if a user is not logged in
function checkNotAuthenticated(request, response, next) {
  if (!loggedIn) {
    return next();
  } else {
    return response.redirect("/home/index");
  }
}

app.listen(port, () => {
  console.log("Listening...");
});
