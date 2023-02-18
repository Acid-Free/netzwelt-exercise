const express = require("express");
const app = express();
const port = 5500;

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
  username = request.body.username;
  password = request.body.password;
  response.send(await verifyAccount(username, password));
});

async function verifyAccount(username, password) {
  // success: {"username":"foo","displayName":"Foo Bar Foo","roles":["basic-user"]}
  // failure: {"message":"Invalid username or password."}
  const response = await fetch(
    "https://netzwelt-devtest.azurewebsites.net/Account/SignIn",
    {
      method: "post",
      body: JSON.stringify({ username: username, password: password }),
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await response.json();

  return data;
}

app.listen(port, () => {
  console.log("Listening...");
});
