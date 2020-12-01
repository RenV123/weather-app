import { WEATHER_CONFIG } from '../config.js';

const openWeatherMap = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5/',
});

function getCurrentWeatherDataForLocation(location) {
  return openWeatherMap.get(
    `/weather?q=${location}&units=metric&appid=${WEATHER_CONFIG.apiKey}`
  );
}

export { getCurrentWeatherDataForLocation };
