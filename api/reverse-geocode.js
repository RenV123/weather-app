require('dotenv').config();
const axios = require('axios');

const openCageDataAPI = axios.create({
  baseURL: 'https://api.opencagedata.com/geocode/v1',
});

/*Reverse Geocoding API Calls */
async function getAddressFromLatLng(lat, lng) {
  //https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=API_KEY
  const response = await openCageDataAPI.get(
    `/json?q=${lat}+${lng}&key=${process.env.OPEN_CAGE_DATA_API_KEY}`
  );
  //TODO: add some validation
  return response.data.results[0];
}

const validOrigins = [
  'https://weather-app-flame.vercel.app/',
  'https://weather-app-renv123.vercel.app',
  'https://weather-app-git-vercel-serverless-functions-renv123.vercel.app',
];

const validateOriginHeader = (origin) => {
  return validOrigins.includes(origin);
};

module.exports = async (request, response) => {
  try {
    const addressResponse = await getAddressFromLatLng(
      request.query.lat,
      request.query.lon
    );
    if (validateOriginHeader(request.headers['host'])) {
      response.setHeader('Access-Control-Allow-Credentials', `true`);
      response.setHeader('Access-Control-Allow-Origin', '*');
    }
    response.send({
      ...addressResponse,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
