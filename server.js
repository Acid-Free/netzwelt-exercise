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

async function getTerritories() {
  const response = await fetch(
    "https://netzwelt-devtest.azurewebsites.net/Territories/All"
  );

  const territoriesObject = await response.json();

  return territoriesObject;
}

// TODO: REMOVE before submitting
async function verifyAccount(username, password) {
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
//
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
