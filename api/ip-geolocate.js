require('dotenv').config();
const axios = require('axios');

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
    const addressResponse = await getLocationFromIp(
      request.headers['x-real-ip']
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
