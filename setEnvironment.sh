echo -e "export var WEATHER_CONFIG = {"  >> config.js
echo -e "  openWeatherMapApiKey: \"$1\",\n  openCageDataAPiKey: \"$2\",\n};"  >> config.js
echo -e "export var UNSPLASH_CONFIG = {"  >> config.js
echo -e "  clientId: \"$3\","  >> config.js
echo -e "  accessKey: \"$4\",\n};"  >> config.js