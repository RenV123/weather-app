import { default as VercelApi } from './Api/vercelApi.js';

(() => {
  const NR_OF_DAYS_TO_FORECAST = 5;

  let imgBackgroundLoader = new Image();
  let lastLocation = '';
  let lastBackgroundUrl = '';
  let lowerOpacityInterval = undefined;
  let isBackgroundLoading = false;

  let cityInput = document.getElementById('location-input');
  let backgroundOneElement = document.getElementById('background-one');
  let backgroundTwoElement = document.getElementById('background-two');
  let weekOverview = document.getElementById('week-overview');
  let locationsContainer = document.getElementById('weather-locations');

  //Define all elements holding data in a single object so we can edit easily later.
  let weatherElements = {
    sunrise: document.getElementById('current-weather-sunrise'),
    sunset: document.getElementById('current-weather-sunset'),
    humidity: document.getElementById('current-weather-humidity'),
    wind: document.getElementById('current-weather-wind'),
    pressure: document.getElementById('current-weather-pressure'),
    temp: document.getElementById('current-weather-temp'),
    city: document.getElementById('current-weather-city'),
    description: document.getElementById('current-weather-description'),
    time: document.getElementById('current-weather-time'),
    date: document.getElementById('current-weather-date'),
    icon: document.getElementById('current-weather-icon'),
  };

  /**
   * Returns a random number between min and max.
   * @param {number} min minimum nr (inclusive)
   * @param {number} max maximum nr exclusive)
   * @return {number} random nr.
   */
  const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * max - min) + min;
  };

  /**
   * Uses the API to get a picture and set it as the page background.
   * @param {String} searchTerm search term to find a matching image for.
   * @param {boolean} [isRandom=true] if true, will retrieve up to 5 images and pick a random one.
   */
  const requestNewBackground = async (searchTerm, isRandom = true) => {
    let imageData = await VercelApi.getPictures(
      `${searchTerm}`,
      isRandom ? 10 : 0 //if it's random get 10 pictures
    );

    if (imageData) {
      let imageUrl = isRandom
        ? selectRandomBackgroundImage(imageData)
        : imageData[0].urls.regular;

      setBackground(imageUrl);
    }
  };

  /**
   * Selects a random background url from a list of images data objects.
   * @param {Array.<object>} imageData
   * @returns {String} url of the background.
   */
  const selectRandomBackgroundImage = (imageData) => {
    let imageUrl = imageData[0].urls.regular;
    if (imageData.length > 1) {
      let nr = getRandomNumber(0, imageData.length);
      imageUrl = imageData[nr].urls.regular;

      //if the image is the same pick the next element
      if (imageUrl === lastBackgroundUrl) {
        nr = ++nr % imageData.length;
        imageUrl = imageData[nr].urls.regular;
      }
    }
    return imageUrl;
  };

  /**
   * Loads the background in and once it's loaded creates a transition
   * effect to the new background.
   * @param {String} url
   */
  const setBackground = (url) => {
    //Don't do anything if there's a background still loading.
    if (isBackgroundLoading) {
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
          lowerBg.style.zIndex = '-1'; //lower is now upper
          upperBg.style.zIndex = '-2';
          upperBg.style.opacity = '100%';
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
  const setAllWeatherData = (weatherData) => {
    weatherElements['city'].innerHTML = weatherData.name;
    setCurrentWeatherData(weatherData.current);
    setNextDaysWeather(weatherData.daily);
  };

  /**
   * Sets the weather data of the current day.
   * @param {object} weatherData
   */
  const setCurrentWeatherData = (weatherData) => {
    //Create dates from unix timestamps.
    let sunriseDateTime = new Date(weatherData.sunrise * 1000);
    let sunsetDateTime = new Date(weatherData.sunset * 1000);
    let dateTime = new Date(weatherData.dt * 1000);

    //Create time formatting options
    //see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
    const timeOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };

    const dateTimeOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    //Use current time and split it into two parts. 'HH:MM' and am/pm part.
    let currentTimeParts = new Date()
      .toLocaleString(undefined, timeOptions)
      .split(' ');

    //Show the current time (HH:MM) with am in slightly smaller font.
    let formattedTime = `${currentTimeParts[0]} ${currentTimeParts[1].fontsize(
      6
    )}`;

    //Format date into string
    let formattedDate = new Intl.DateTimeFormat(
      undefined,
      dateTimeOptions
    ).format(dateTime);

    weatherElements['sunrise'].innerHTML = `${sunriseDateTime.toLocaleString(
      undefined,
      timeOptions
    )}`;
    weatherElements['sunset'].innerHTML = `${sunsetDateTime.toLocaleString(
      undefined,
      timeOptions
    )}`;
    weatherElements['humidity'].innerHTML = `${weatherData.humidity} %`;
    weatherElements['wind'].innerHTML = `${weatherData.wind_speed} km/h`;
    weatherElements['pressure'].innerHTML = `${weatherData.pressure} hPa`;
    weatherElements['temp'].innerHTML = `${parseInt(weatherData.temp)}°`;
    weatherElements['description'].innerHTML =
      weatherData.weather[0].description;
    weatherElements['time'].innerHTML = formattedTime;
    weatherElements['date'].innerHTML = formattedDate;

    weatherElements[
      'icon'
    ].className = `weather-icon owf owf-${weatherData.weather[0].id} owf-5x`;
  };

  /**
   * Sets the weather data of the following days in a table in the sidebar.
   * @param {Array.<object>} weatherDataArr
   */
  const setNextDaysWeather = (weatherDataArr) => {
    //Add +1 because we don't show the current day.
    let nrOfItems = Math.min(NR_OF_DAYS_TO_FORECAST + 1, weatherDataArr.length);

    weekOverview.innerHTML = ''; //remove children
    for (let i = 1; i < nrOfItems; i++) {
      //get weekday name, temp, icon
      let weekday = new Date(
        weatherDataArr[i].dt * 1000
      ).toLocaleDateString(undefined, { weekday: 'long' });
      let temp = weatherDataArr[i].temp.day;
      let iconCode = weatherDataArr[i].weather[0].id;

      //Create element
      let row = generateTableRow(weekOverview, { weekday, temp });

      //Add weather icon (using owfont)
      var weatherIcon = document.createElement('i');
      weatherIcon.className = `owf owf-${iconCode} owf-1x`;
      row.insertCell().appendChild(weatherIcon);

      row.onclick = () => {
        setCurrentWeatherData(weatherDataArr[i]);
      };
    }
  };

  /**
   * Generates a table row based on the values of the data object
   * @param {HTMLElement} table a table element
   * @param {object} data an object, the values will be placed in a cell.
   * @return {HTMLElement} The generated row.
   */
  const generateTableRow = (table, data) => {
    let row = table.insertRow();

    Object.values(data).forEach((value) => {
      let cell = row.insertCell();
      let text = document.createTextNode(value);
      cell.appendChild(text);
    });

    return row;
  };

  /**
   * Adds a location to a list of recently searched locations.
   * @param {String} newLocation
   */
  const addWeatherLocation = (newLocation) => {
    //TODO: Store these locations in a cookie
    //Get all locations
    let locationElements = Array.from(
      document.querySelectorAll('#weather-locations > option')
    );

    //Confirm new location is not in it yet.
    let isInList =
      locationElements.find(
        (element) => element.value.toLowerCase() == newLocation.toLowerCase()
      ) !== undefined;

    if (!isInList) {
      //Add new location
      var newOption = document.createElement('option');
      newOption.value = newLocation;
      locationsContainer.appendChild(newOption);
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
      console.log('Geolocation is not supported by this browser.');
    }
  };

  /**
   * Updates the page based on the user location.
   * Gets the weather data and displays it
   * Retrieves a matching background based on the weather description.
   * @param {String} location the location to retrieve weather data from.
   * @return {boolean} true if the update was successful
   */
  const updatePage = async (location) => {
    let weeklyWeatherData = await VercelApi.getWeeklyWeatherDataForLocation(
      location
    );

    lastLocation = location;
    setAllWeatherData(weeklyWeatherData);

    let weatherDescription = `${weeklyWeatherData.name} ${weeklyWeatherData.current.weather[0].main}`;
    requestNewBackground(weatherDescription, true);
    return true;
  };

  /**
   * Callback with coordinates of user location.
   * Updates the page with the users location.
   * @param {object} position
   */
  const onUserLocationRetrieved = async (position) => {
    let response = await VercelApi.getAddressFromLatLng(
      position.coords.latitude,
      position.coords.longitude
    );

    let location = response?.components?.city;
    if (!location) {
      location = response?.components?.village;
    }
    if (!location) {
      location = response?.components?.county;
    }

    if (location) {
      addWeatherLocation(location);
      updatePage(location);
    } else {
      console.error(`Couldn't determine location from: ${response}`);
    }
  };

  /**
   * Called whenever the user denies the location request.
   * @param {String} error
   */
  const onUserLocationDenied = (error) => {
    console.error(error);
  };

  /**
   * Starts an interval that will update the page at exactly the start of every minute.
   */
  const startPageUpdateInterval = () => {
    /*Update page every minute*/
    let secondsTillNextMinute = 60 - new Date().getSeconds();

    //Start an interval with the delay
    setTimeout(() => {
      //First time we need to call it manually as the interval will only trigger the next minute.
      if (lastLocation) {
        updatePage(lastLocation);
      }

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
    let successfullyUpdated = await updatePage(cityInput.value);
    if (successfullyUpdated) {
      addWeatherLocation(cityInput.value);
      cityInput.value = '';
    } else {
      //Show error animation by adding error class.
      cityInput.classList.add('error');
      setTimeout(function () {
        cityInput.classList.remove('error');
        cityInput.value = '';
      }, 1000);
    }
  };

  /* Add Event Listeners */
  document
    .getElementById('search-weather-button')
    .addEventListener('click', onSubmit);
  cityInput.addEventListener('submit', onSubmit);

  /*Listen to enter key press in input box */
  cityInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      onSubmit(event);
    }
  });

  requestUserLocation();
  startPageUpdateInterval();
})();
