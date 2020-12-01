import { getCurrentWeatherDataForLocation } from './Api/openweathermap.js';
(() => {
  const onSubmit = async (event) => {
    event.preventDefault();
    var location = document.getElementById('city').value;
    var promise = await getCurrentWeatherDataForLocation(location);
    console.log(promise.data);
  };
  document
    .getElementById('location-date-form')
    .addEventListener('submit', onSubmit);
})();
