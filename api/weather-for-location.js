require('dotenv').config();
const axios = require('axios');

const openWeatherMapAPI = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
});

async function getCurrentWeatherDataForLocation(location) {
  return await openWeatherMapAPI.get(
    `/weather?q=${location}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
  );
}

const validOrigins = [
  'https://weather-app-flame.vercel.app/',
  'https://weather-app-renv123.vercel.app',
  'https://weather-app-git-vercel-serverless-functions-renv123.vercel.app',
];

const validateOriginHeader = (origin) => {
  return validOrigins.includes(origin);
};

module.exports = async (request, response) => {
  try {
    const weatherDataResponse = await getCurrentWeatherDataForLocation(
      request.query.location
    );
    if (validateOriginHeader(request.headers['host'])) {
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
