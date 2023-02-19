const jwt = require("jsonwebtoken");

// Checks if a user is logged in by checking user token validity
exports.checkAuthenticated = (request, response, next) => {
  user = jwtAuthenticator(request);

  // If user is object, it is valid, so proceed to destination
  if (typeof user === "object") {
    // Insert obtained user object to request object for next()
    request.user = user;

    return next();
  }
  // If user is not object, it can only be false, so redirect to login
  else {
    // If verify throws an error, userToken has different signature, remove it
    response.clearCookie("userToken");

    return response.redirect("/account/login");
  }
};

// Checks if a user is not logged in by checking user token validity
exports.checkNotAuthenticated = (request, response, next) => {
  loggedIn = jwtAuthenticator(request);

  // If user is not logged in, redirect to destination
  if (!loggedIn) {
    return next();
  }
  // If user is logged in, keep them at /home/index
  else {
    return response.redirect("/home/index");
  }
};

// Obtains and verifies user token, returns user info if valid; false otherwise
function jwtAuthenticator(request) {
  // Get user token stored in cookies
  const userToken = request.cookies.userToken;

  try {
    // Get user object from user token using a secret key
    const user = jwt.verify(userToken, process.env.JWT_SECRET);

    return user;
  } catch (error) {
    return false;
  }
}
