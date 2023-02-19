// Returns user information if account credentials are valid; false otherwise
exports.verifyAccount = async (request) => {
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
};
