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

module.exports = async (request, response) => {
  try {
    const location = request?.query?.location;
    return await getCurrentWeatherDataForLocation(location);
  } catch (err) {
    res.send({
      status: 500,
      message: err.message,
    });
  }
};
