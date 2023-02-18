const express = require("express");
const app = express();
const port = 5500;

app.set("view-engine", "ejs");

app.get("/", (request, response) => {
  response.redirect("/home/index");
});

app.get("/home/index", (request, response) => {
  response.render("index.ejs");
});

app.get("/account/login", (request, response) => {
  response.render("login.ejs");
});

app.listen(port, () => {
  console.log("Listening...");
});
