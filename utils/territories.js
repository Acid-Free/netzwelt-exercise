// Returns an object of territories
exports.getTerritories = async () => {
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
};
