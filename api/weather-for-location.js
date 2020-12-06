import Status from 'http-status-codes';
require("dotenv").config();
const axios = require("axios");


const openWeatherMapAPI = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5",
});

async function getCurrentWeatherDataForLocation(location) {
  return await openWeatherMapAPI.get(
    `/weather?q=${location}&units=metric&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}`
  );
}

export default (request, response) => {
    if (request.method !== 'GET') {
      return response.status(Status.BAD_REQUEST).send('');
    }
    const location = request?.query?.location;
    return await getCurrentWeatherDataForLocation(location);
};
