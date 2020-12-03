#!/bin/bash
{
    echo -e "export var WEATHER_CONFIG = {"  
    echo -e "  openWeatherMapApiKey: \"$1\",\n  openCageDataAPiKey: \"$2\",\n};"
    echo -e "export var UNSPLASH_CONFIG = {"
    echo -e "  clientId: \"$3\","
    echo -e "  accessKey: \"$4\",\n};"  
} >> config.js
