import {
  getCurrentWeatherDataForLocation,
  getAddressFromLatLng,
  getPictureforLocation,
} from "./Api/apis.js";
(() => {
  let cityInput = document.getElementById("city");

  const setPageBackground = (imageUrl) => {
    let bodyElement = document.getElementById("background");
    bodyElement.style.backgroundImage = `url('${imageUrl}')`;
  };

  const requestUserLocation = () => {
    //https://www.w3schools.com/html/html5_geolocation.asp
    //Note, it's highly likely that a user might deny our site it's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onUserLocationRetrieved,
        onUserLocationDenied
      );
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  };

  const onUserLocationRetrieved = async (position) => {
    let response = await getAddressFromLatLng(
      position.coords.latitude,
      position.coords.longitude
    );
    cityInput.value = response.components.city;
  };

  const onUserLocationDenied = (error) => {
    console.error(error);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    var location = cityInput.value;
    var weatherDataResponse = await getCurrentWeatherDataForLocation(location);
    console.log(weatherDataResponse);
    var pictureDataResponse = await getPictureforLocation(`${location} city`);
    console.log(pictureDataResponse);
    setPageBackground(pictureDataResponse);
  };

  requestUserLocation();
  document
    .getElementById("location-date-form")
    .addEventListener("submit", onSubmit);
})();
