'use strict';

const vercelServerlessAPI = axios.create({
  baseURL: 'https://weather-app-renv123.vercel.app/api/',
});

/*Weather API Calls */
/**
 * Returns the weather data for a location of today.
 * @param {String} location the location to get the weather of. (e.g. 'London')
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getCurrentWeatherDataForLocation(location) {
  let response = await _doApiCall(`/weather-for-location?location=${location}`);
  return response?.data;
}

/**
 * Returns the weather data for a location of the next week.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getWeeklyWeatherDataForCoords(lat, lon) {
  let response = await _doApiCall(`/weather-for-week?lat=${lat}&lon=${lon}`);
  return response?.data;
}

/**
 * Returns the weather data for a location of the next week.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getWeeklyWeatherDataForLocation(location) {
  let currentWeatherResponse = await getCurrentWeatherDataForLocation(location);
  let { lon, lat } = currentWeatherResponse?.coord;
  let response = await getWeeklyWeatherDataForCoords(lat, lon);
  return {
    ...response,
    name: currentWeatherResponse.name,
  };
}

/**
 * Returns an address based on the lat lon given.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getAddressFromLatLng(lat, lon) {
  let response = await _doApiCall(`/reverse-geocode?lat=${lat}&lon=${lon}`);
  return response?.data;
}

/**
 * Gets an address based on the ip of the client
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getAddressFromIP() {
  let response = await _doApiCall(`/ip-geolocate`);
  return response?.data;
}

/**
 * Retrieves a list of pictures based on the queryterm.
 * Note: only returns the metadata and the url not the actual pictures.
 * @param {String} queryTerm search term to look for images
 * @param {number} [nrOfPictures=1] nr of pictures to retrieve.
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function getPictures(queryTerm, nrOfPictures = 1) {
  let response = await _doApiCall(
    `/picture?query=${queryTerm}&nr=${nrOfPictures}`
  );
  return response?.data?.results;
}

/**
 * Internal function used to do Vercel api calls.
 * Do not use outside this class !!
 * @access private
 * @param {string} url - the url to call (without the base url).
 * @returns {Promise} a promise containing the data or undefined if there was an error.
 */
async function _doApiCall(url = isRequired()) {
  let response = undefined;
  try {
    response = await vercelServerlessAPI.get(url);
  } catch (error) {
    console.error(error);
  }
  return response;
}

/**
 * Internal function used to validated params
 * Do not use outside this class !!
 * @access private
 */
const isRequired = () => {
  throw new Error('param is required');
};

export default {
  getCurrentWeatherDataForLocation,
  getWeeklyWeatherDataForCoords,
  getWeeklyWeatherDataForLocation,
  getAddressFromLatLng,
  getAddressFromIP,
  getPictures,
};
