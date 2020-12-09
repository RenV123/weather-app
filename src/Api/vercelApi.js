const vercelServerlessAPI = axios.create({
  baseURL: "https://weather-app.renv123.vercel.app/api/",
});

/*Weather API Calls */
async function getCurrentWeatherDataForLocation(location) {
  let response = await vercelServerlessAPI.get(
    `/weather-for-location?location=${location}`
  );
  return response.data;
}

async function getWeeklyWeatherData(lat, lon) {
  let response = await vercelServerlessAPI.get(
    `/weather-for-week?lat=${lat}&lon=${lon}`
  );
  return response.data;
}

/*Reverse Geocoding API Calls */
async function getAddressFromLatLng(lat, lon) {
  let response = await vercelServerlessAPI.get(
    `/reverse-geocode?lat=${lat}&lon=${lon}`
  );
  return response.data;
}

/*Unsplash API calls */
async function getPicture(queryTerm, nrOfPictures) {
  let response = await vercelServerlessAPI.get(
    `/picture?query=${queryTerm}&nr=${nrOfPictures}`
  );
  return response.data.results;
}

export {
  getCurrentWeatherDataForLocation,
  getWeeklyWeatherData,
  getAddressFromLatLng,
  getPicture,
};
