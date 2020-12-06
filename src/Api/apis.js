//File containing a json obj called WEATHER_CONFIG with my api key.

const vercelServerlessAPI = axios.create({
  baseURL: "https://weather-app.renv123.vercel.app/api/",
});

/*Weather API Calls */
async function getCurrentWeatherDataForLocation(location) {
  return await vercelServerlessAPI.get(
    `/weather-for-location?location=${location}`
  );
}

async function getWeeklyWeatherData(lat, long) {
  return await vercelServerlessAPI.get(
    `/weather-for-week?lat=${lat}&lon=${lon}`
  );
}

/*Reverse Geocoding API Calls */
async function getAddressFromLatLng(lat, lng) {
  return await vercelServerlessAPI.get(
    `/reverse-geocode?lat=${lat}&lon=${lng}`
  );
}

/*Unsplash API calls */
async function getPicture(queryTerm, nrOfPictures) {
  return await vercelServerlessAPI.get(
    `/picture?query=${queryTerm}&nr${nrOfPictures}`
  );
}

export {
  getCurrentWeatherDataForLocation,
  getWeeklyWeatherData,
  getAddressFromLatLng,
  getPicture,
};
