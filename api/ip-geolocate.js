require('dotenv').config();
const axios = require('axios');
import { validateOriginHeader } from './helpers/validateOrigin';

const ipGeoLocate = axios.create({
  baseURL: 'https://ipgeolocation.abstractapi.com/v1',
});

/*IP Geocode API Call */
async function getLocationFromIp(ipAddress) {
  const response = await ipGeoLocate.get(
    `/?api_key=${process.env.IPGEOLOCATE_API_KEY}&ip_address=${ipAddress}`
  );
  return response.data;
}

module.exports = async (request, response) => {
  try {
    const addressResponse = await getLocationFromIp(
      request.headers['x-real-ip']
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
