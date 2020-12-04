import {
  getCurrentWeatherDataForLocation,
  getAddressFromLatLng,
  getPicture,
} from "./Api/apis.js";
(() => {
  let cityInput = document.getElementById("location-input");
  let backgroundOneElement = document.getElementById("background-one");
  let backgroundTwoElement = document.getElementById("background-two");
  let imgBackgroundLoader = new Image();
  let lastLocation = "";
  let lowerOpacityInterval = undefined;
  let isBackgroundLoading = false;

  /**
   * Returns a random number between min and max (inclusive)
   * @param {number} min
   * @param {number} max
   */
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * max - min) + min;
  };

  /**
   * Uses the API to get a picture and set it as the page background.
   * @param {string} searchTerm search term to find a matching image for.
   * @param {boolean} isRandom if true, will retrieve up to 5 images and pick a random one.
   */
  const requestNewBackground = async (searchTerm, isRandom) => {
    let imageData = await getPicture(
      `${searchTerm}`,
      isRandom ? 5 : 0 //if it's random get 10 pictures
    );
    let nr = getRandomNumber(0, 5);

    //Use regular sized image for now
    //TODO: query bg size based on viewport size
    let imageUrl = imageData[nr].urls.regular;
    setBackground(imageUrl);
  };

  const setBackground = (url) => {
    //Don't do anything if there's a background still loading.
    if (isBackgroundLoading) {
      console.log(`Skipped loading bg: ${url}`);
      return;
    }
    let isBackgroundOneLarger =
      Number(backgroundOneElement.style.zIndex) >
      Number(backgroundTwoElement.style.zIndex);
    let upperBg = isBackgroundOneLarger
      ? backgroundOneElement
      : backgroundTwoElement;
    let lowerBg = isBackgroundOneLarger
      ? backgroundTwoElement
      : backgroundOneElement;

    //Set img to lowerbg, once loaded lower opacity of upperbg to 0 and swap zIndexes;
    // This creates a smooth transition between backgrounds
    imgBackgroundLoader.onload = (event) => {
      lowerBg.style.backgroundImage = `url('${imgBackgroundLoader.src}')`;

      var currentOpacity = 1.0;
      isBackgroundLoading = true;
      lowerOpacityInterval = setInterval(() => {
        currentOpacity -= 0.05;
        upperBg.style.opacity = `${currentOpacity}`;
        if (currentOpacity <= 0) {
          lowerBg.style.zIndex = "-1"; //lower is now upper
          upperBg.style.zIndex = "-2";
          upperBg.style.opacity = "100%";
          clearInterval(lowerOpacityInterval);
          isBackgroundLoading = false;
        }
      }, 50); //total transition time 1 sec
    };
    imgBackgroundLoader.src = url;
  };

  /**
   * Fills in the weather elements of the page based on the weather data.
   * @param {object} weatherData
   */
  const setWeatherData = (weatherData) => {
    /*Weather details */
    let sunriseDateTime = new Date(weatherData.sys.sunrise * 1000);
    let sunsetDateTime = new Date(weatherData.sys.sunset * 1000);
    let dateTime = new Date(weatherData.dt * 1000);
    let timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    //ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    const dateTimeOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    document.getElementById(
      "current-weather-sunrise"
    ).innerHTML = `${sunriseDateTime.toLocaleString(undefined, timeOptions)}`;
    document.getElementById(
      "current-weather-sunset"
    ).innerHTML = `${sunsetDateTime.toLocaleString(undefined, timeOptions)}`;
    document.getElementById(
      "current-weather-humidity"
    ).innerHTML = `${weatherData.main.humidity}%`;
    document.getElementById(
      "current-weather-wind"
    ).innerHTML = `${weatherData.wind.speed}km/h`;
    document.getElementById(
      "current-weather-pressure"
    ).innerHTML = `${weatherData.main.pressure} hPa`;

    document.getElementById("current-weather-temp").innerHTML = `${parseInt(
      weatherData.main.temp
    )}°`;
    document.getElementById("current-weather-city").innerHTML =
      weatherData.name;
    document.getElementById("current-weather-description").innerHTML =
      weatherData.weather[0].description;

    //Note not using the time of the weather data but the currenttime
    let currentTime = new Date();
    let currentTimeStr = currentTime.toLocaleString(undefined, timeOptions);
    let currentTimeParts = currentTimeStr.split(" ");
    document.getElementById("current-weather-time").innerHTML = `${
      currentTimeParts[0]
    } ${currentTimeParts[1].fontsize(6)} `;

    document.getElementById(
      "current-weather-date"
    ).innerHTML = new Intl.DateTimeFormat("en-GB", dateTimeOptions).format(
      dateTime
    );
  };

  const addWeatherLocation = (newLocation) => {
    //Get all locations
    let locationElements = Array.from(
      document.querySelectorAll("#weather-locations > li")
    );
    //Confirm new location is not in it yet.
    let isInList =
      locationElements.find((element) => element.innerHTML == newLocation) !==
      undefined;
    if (!isInList) {
      //Add new location
      let locationsContainer = document.getElementById("weather-locations");
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(newLocation));
      li.onclick = onListElementClick;
      locationsContainer.insertBefore(li, locationsContainer.firstChild);

      //Check if amount of locations is not higher then max
      while (locationsContainer.childElementCount > 5) {
        locationsContainer.removeChild(locationsContainer.lastChild);
      }
    }
  };

  /**
   * Requests the user location
   */
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

  /**
   * Updates the page based on the user location.
   * Gets the weather data and displays it
   * Retrieves a matching background based on the weather description.
   * @param {string} location
   */
  const updatePage = async (location) => {
    if (location) {
      lastLocation = location;
      let weatherDataResponse = await getCurrentWeatherDataForLocation(
        location
      );
      setWeatherData(weatherDataResponse.data);

      let weatherDescription = weatherDataResponse.data.weather[0].main;
      requestNewBackground(weatherDescription, true);
    }
  };

  /**
   * Callback with coordinates of user location.
   * Updates the page with the users location.
   * @param {object} position
   */
  const onUserLocationRetrieved = async (position) => {
    let response = await getAddressFromLatLng(
      position.coords.latitude,
      position.coords.longitude
    );

    updatePage(response.components.city);
  };

  const onUserLocationDenied = (error) => {
    console.error(error);
  };

  /**
   * Starts an interval that will update the page at exactly the start of every minute.
   */
  const startPageUpdateInterval = () => {
    /*Update page every minute*/
    let time = new Date();
    let secondsTillNextMinute = 60 - time.getSeconds();
    //Start an interval with the delay of
    setTimeout(() => {
      //First time we need to call it manually as the interval will only trigger the next minute.
      updatePage(lastLocation);
      setInterval(() => {
        updatePage(lastLocation);
      }, 1000 * 60);
    }, 1000 * secondsTillNextMinute);
  };

  /**
   * Callback for updating the page.
   * @param {any} event
   */
  const onSubmit = async (event) => {
    event.preventDefault();
    addWeatherLocation(cityInput.value);
    updatePage(cityInput.value);
    cityInput.value = "";
  };

  function onListElementClick() {
    cityInput.value = "";
    updatePage(this.innerHTML);
  }

  /* Add Event Listeners*/
  document
    .getElementById("search-weather-button")
    .addEventListener("click", onSubmit);
  cityInput.addEventListener("submit", onSubmit);
  cityInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      onSubmit(event);
    }
  });

  Array.from(document.querySelectorAll("#weather-locations > li")).forEach(
    (liElement) => {
      liElement.addEventListener("click", onListElementClick);
    }
  );

  requestUserLocation();
  startPageUpdateInterval();
})();
