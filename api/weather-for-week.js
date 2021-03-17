require('dotenv').config();
const axios = require('axios');
import validateOriginHeader from './helpers/validateOrigin';

const openWeatherMapAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
});

async function getWeeklyWeatherData(lat, long) {
  return await openWeatherMapAPI.get(
    `/onecall?lat=${lat}&lon=${long}&exclude=minutely,hourly,alerts&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
  );
}

module.exports = async (request, response) => {
  try {
    const weatherDataResponse = await getWeeklyWeatherData(
      request.query.lat,
      request.query.lon
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
