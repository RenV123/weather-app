require('dotenv').config();
require('./helpers/validateOrigin');
const axios = require('axios');

const openWeatherMapAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
});

async function getCurrentWeatherDataForLocation(location) {
  return await openWeatherMapAPI.get(
    `/weather?q=${location}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
  );
}

module.exports = async (request, response) => {
  try {
    const weatherDataResponse = await getCurrentWeatherDataForLocation(
      request.query.location
    );
    if (validateOriginHeader(request.headers['Origin'])) {
      response.setHeader('Access-Control-Allow-Credentials', `true`);
      response.setHeader('Access-Control-Allow-Origin', '*');
    }
    response.send({
      ...weatherDataResponse.data,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
