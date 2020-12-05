//File containing a json obj called WEATHER_CONFIG with my api key.
import { WEATHER_CONFIG, UNSPLASH_CONFIG } from "../config.js";

const openWeatherMapAPI = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5",
});

const openCageDataAPI = axios.create({
  baseURL: "https://api.opencagedata.com/geocode/v1",
});

const unsplashAPI = axios.create({
  baseURL: "https://api.unsplash.com/",
  headers: {
    Authorization: `Client-ID ${UNSPLASH_CONFIG.accessKey}`, //the token is a variable which holds the token
  },
});

/*Weather API Calls */
async function getCurrentWeatherDataForLocation(location) {
  return await openWeatherMapAPI.get(
    `/weather?q=${location}&units=metric&appid=${WEATHER_CONFIG.openWeatherMapApiKey}`
  );
}

async function getWeeklyWeatherData(lat, long) {
  return await openWeatherMapAPI.get(
    `/onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly,alerts&units=metric&appid=${WEATHER_CONFIG.openWeatherMapApiKey}`
  );
}

function getWeatherIcon(iconCode) {
  const openWeatherMapImgBaseUrl = " http://openweathermap.org/img/wn/";
  return `${openWeatherMapImgBaseUrl}${iconCode}@2x.png`;
}

/*Reverse Geocoding API Calls */
async function getAddressFromLatLng(lat, lng) {
  //https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=API_KEY
  var response = await openCageDataAPI.get(
    `/json?q=${lat}+${lng}&key=${WEATHER_CONFIG.openCageDataAPiKey}`
  );
  //TODO: add some validation
  return response.data.results[0];
}

/*Unsplash API calls */
async function getPicture(location, nrOfPictures) {
  var response = await unsplashAPI.get(
    `/search/photos?query=${location}&per_page=${nrOfPictures}&orientation=landscape`
  );
  //TODO: add some validation
  return response.data.results;
}

export {
  getCurrentWeatherDataForLocation,
  getWeeklyWeatherData,
  getWeatherIcon,
  getAddressFromLatLng,
  getPicture,
};
