const express = require("express");
const app = express();
const port = 5500;

let username;
let password;

app.set("view-engine", "ejs");

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

app.post("/account/login", (request, response) => {
  username = request.body.username;
  password = request.body.password;
});

app.listen(port, () => {
  console.log("Listening...");
});
