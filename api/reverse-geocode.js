require('dotenv').config();
const axios = require('axios');
import { validateOriginHeader } from './helpers/validateOrigin';

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

module.exports = async (request, response) => {
  try {
    const addressResponse = await getAddressFromLatLng(
      request.query.lat,
      request.query.lon
    );
    if (validateOriginHeader(request.headers['Origin'])) {
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
