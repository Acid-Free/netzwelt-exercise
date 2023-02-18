const express = require("express");
const app = express();
const port = 5500;

let loggedIn = false;

app.set("view-engine", "ejs");

// allows parsing of urlencoded payloads
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.redirect("/home/index");
});

app.get("/home/index", (request, response) => {
  response.render("index.ejs");
});

app.get("/account/login", (request, response) => {
  response.render("login.ejs");
});

app.post("/account/login", async (request, response) => {
  loggedIn = await verifyAccount(request.body.username, request.body.password);
  if (loggedIn) {
    response.send("valid");
  } else {
    response.send("invalid");
  }
});

// returns true if account credentials are valid; false otherwise
async function verifyAccount(username, password) {
  // success: {"username":"foo","displayName":"Foo Bar Foo","roles":["basic-user"]}
  // failure: {"message":"Invalid username or password."}
  const validKeys = ["username", "displayName", "roles"];

  const response = await fetch(
    "https://netzwelt-devtest.azurewebsites.net/Account/SignIn",
    {
      method: "post",
      body: JSON.stringify({ username: username, password: password }),
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await response.json();
  const dataKeys = Object.keys(data);

  // parse the arrays into strings; if they are strictly equal, the data satisfies the structure of a valid account
  return JSON.stringify(validKeys) === JSON.stringify(dataKeys);
}

app.listen(port, () => {
  console.log("Listening...");
});
