import {
  getCurrentWeatherDataForLocation,
  getWeeklyWeatherData,
  getAddressFromLatLng,
  getPicture,
} from "./Api/apis.js";
(() => {
  const NR_OF_LOCATIONS_IN_HISTORY = 3;
  const NR_OF_DAYS_TO_FORECAST = 5;
  let imgBackgroundLoader = new Image();
  let lastLocation = "";
  let lastBackgroundUrl = "";
  let lowerOpacityInterval = undefined;
  let isBackgroundLoading = false;
  let cityInput = document.getElementById("location-input");
  let backgroundOneElement = document.getElementById("background-one");
  let backgroundTwoElement = document.getElementById("background-two");
  let weekOverview = document.getElementById("week-overview");

  //Define all elements holding data in a single object so we can edit easily later.
  let weatherElements = {
    sunrise: document.getElementById("current-weather-sunrise"),
    sunset: document.getElementById("current-weather-sunset"),
    humidity: document.getElementById("current-weather-humidity"),
    wind: document.getElementById("current-weather-wind"),
    pressure: document.getElementById("current-weather-pressure"),
    temp: document.getElementById("current-weather-temp"),
    city: document.getElementById("current-weather-city"),
    description: document.getElementById("current-weather-description"),
    time: document.getElementById("current-weather-time"),
    date: document.getElementById("current-weather-date"),
    icon: document.getElementById("current-weather-icon"),
  };

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
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
      isRandom ? 10 : 0 //if it's random get 10 pictures
    );

    let imageUrl = imageData[0].urls.regular;
    if (imageData.length > 1 && isRandom) {
      let nr = getRandomNumber(0, imageData.length);
      imageUrl = imageData[nr].urls.regular;
      if (imageUrl === lastBackgroundUrl) {
        nr = ++nr % imageData.length;
        imageUrl = imageData[nr].urls.regular;
      }
    }
    //Use regular sized image for now
    //TODO: query bg size based on viewport size
    setBackground(imageUrl);
  };

  /**
   * Loads the background in and once it's loaded creates a transition
   * effect to the new background.
   * @param {string} url
   */
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
    lastBackgroundUrl = url;
  };

  /**
   * Fills in the weather elements of the page based on the weather data.
   * @param {object} weatherData
   */
  const setWeatherData = (weatherData) => {
    /*Weather details */
    let sunriseDateTime = new Date(weatherData.current.sunrise * 1000);
    let sunsetDateTime = new Date(weatherData.current.sunset * 1000);
    let dateTime = new Date(weatherData.current.dt * 1000);
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

    //Show the current time with AM slightly smaller
    let currentTimeParts = new Date()
      .toLocaleString(undefined, timeOptions)
      .split(" ");
    let formattedTime = `${currentTimeParts[0]} ${currentTimeParts[1].fontsize(
      6
    )}`;
    let formattedDate = new Intl.DateTimeFormat(
      undefined,
      dateTimeOptions
    ).format(dateTime);

    weatherElements["sunrise"].innerHTML = `${sunriseDateTime.toLocaleString(
      undefined,
      timeOptions
    )}`;
    weatherElements["sunset"].innerHTML = `${sunsetDateTime.toLocaleString(
      undefined,
      timeOptions
    )}`;
    weatherElements["humidity"].innerHTML = `${weatherData.current.humidity} %`;
    weatherElements[
      "wind"
    ].innerHTML = `${weatherData.current.wind_speed} km/h`;
    weatherElements[
      "pressure"
    ].innerHTML = `${weatherData.current.pressure} hPa`;
    weatherElements["temp"].innerHTML = `${parseInt(
      weatherData.current.temp
    )}°`;
    weatherElements["city"].innerHTML = weatherData.name;
    weatherElements["description"].innerHTML =
      weatherData.current.weather[0].description;
    weatherElements["time"].innerHTML = formattedTime;
    weatherElements["date"].innerHTML = formattedDate;

    /*weatherElements["icon"].src = getWeatherIcon(
      weatherData.current.weather[0].icon
    );*/
    weatherElements[
      "icon"
    ].className = `weather-icon owf owf-${weatherData.current.weather[0].id} owf-5x`;

    //TODO: Add next day weather info.
    setNextDaysWeather(weatherData.daily);
  };

  const setNextDaysWeather = (weatherData) => {
    let nrOfItems = Math.min(NR_OF_DAYS_TO_FORECAST + 1, weatherData.length);

    weekOverview.innerHTML = ""; //remove children
    for (let i = 1; i < nrOfItems; i++) {
      //get weekday name, temp, icon
      let weekday = new Date(
        weatherData[i].dt * 1000
      ).toLocaleDateString(undefined, { weekday: "long" });
      let temp = weatherData[i].temp.day;
      let iconCode = weatherData[i].weather[0].id;

      //Create element

      let row = weekOverview.insertRow();
      row.insertCell().innerHTML = weekday;
      row.insertCell().innerHTML = `${temp} °`;

      //Add weather icon
      var weatherIcon = document.createElement("i");
      weatherIcon.className = `owf owf-${iconCode} owf-1x`;
      row.insertCell().appendChild(weatherIcon);
    }
  };

  const addWeatherLocation = (newLocation) => {
    //TODO: Store these locations in a cookie
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
      while (
        locationsContainer.childElementCount > NR_OF_LOCATIONS_IN_HISTORY
      ) {
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
   * @return {boolean} true if the update was successful
   */
  const updatePage = async (location) => {
    if (location) {
      let weatherDataResponse = undefined;
      let weeklyWeatherDataResponse = undefined;
      try {
        weatherDataResponse = await getCurrentWeatherDataForLocation(location);
        //see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
        var { lat, lon } = weatherDataResponse.data.coord;
        weeklyWeatherDataResponse = await getWeeklyWeatherData(lat, lon);
      } catch (error) {
        console.error(error);
        return false;
      }
      lastLocation = location;
      setWeatherData({
        name: weatherDataResponse.data.name,
        ...weeklyWeatherDataResponse.data,
      });

      let weatherDescription = `${weatherDataResponse.data.name} ${weeklyWeatherDataResponse.data.current.weather[0].main}`;
      requestNewBackground(weatherDescription, true);
      return true;
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
    if (await updatePage(cityInput.value)) {
      addWeatherLocation(cityInput.value);
      cityInput.value = "";
    } else {
      //Show error animation by adding error class.
      cityInput.classList.add("error");
      setTimeout(function () {
        cityInput.classList.remove("error");
        cityInput.value = "";
      }, 1000);
    }
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
