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
  // TODO: add error handling
  let { data } = await getTerritories();
  response.render("index.ejs", { territories: data });
});

app.get("/account/login", (request, response) => {
  const message = request.flash("flash-message");
  response.render("login.ejs", { message });
});

app.post("/account/login", async (request, response) => {
  loggedIn = await verifyAccount(request.body.username, request.body.password);
  if (loggedIn) {
    response.redirect("/home/index");
  } else {
    request.flash("flash-message", "Invalid username or password");
    response.redirect("/account/login");
  }
});

// TODO: remove after dev
function getTerritories() {
  return { data: [] };
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

// async function getTerritories() {
//   const response = await fetch(
//     "https://netzwelt-devtest.azurewebsites.net/Territories/All"
//   );

//   const territoriesObject = await response.json();

//   return territoriesObject;
// }

// TODO: remove after dev
function verifyAccount(username, password) {
  return true;
}

// returns true if account credentials are valid; false otherwise
// async function verifyAccount(username, password) {
//   // success: {"username":"foo","displayName":"Foo Bar Foo","roles":["basic-user"]}
//   // failure: {"message":"Invalid username or password."}
//   const validKeys = ["username", "displayName", "roles"];

//   const response = await fetch(
//     "https://netzwelt-devtest.azurewebsites.net/Account/SignIn",
//     {
//       method: "post",
//       body: JSON.stringify({ username: username, password: password }),
//       headers: { "Content-Type": "application/json" },
//     }
//   );

//   const data = await response.json();
//   const dataKeys = Object.keys(data);

//   // parse the arrays into strings; if they are strictly equal, the data satisfies the structure of a valid account
//   return JSON.stringify(validKeys) === JSON.stringify(dataKeys);
// }

// checks if a user is logged in
function checkAuthenticated(request, response, next) {
  if (loggedIn) {
    return next();
  } else {
    return response.redirect("/account/login");
  }
}

app.listen(port, () => {
  console.log("Listening...");
});
