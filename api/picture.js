require('dotenv').config();
const axios = require('axios');

const unsplashAPI = axios.create({
  baseURL: 'https://api.unsplash.com/',
  headers: {
    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
  },
});

/*Unsplash API calls */
async function getPicture(query, nrOfPictures) {
  const response = await unsplashAPI.get(
    `/search/photos?query=${query}&per_page=${nrOfPictures}&orientation=landscape`
  );
  //TODO: add some validation
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
    const picturesResponse = await getPicture(
      request.query.query,
      request.query.nr
    );
    if (validateOriginHeader(request.headers['host'])) {
      response.setHeader('Access-Control-Allow-Credentials', `true`);
      response.setHeader('Access-Control-Allow-Origin', '*');
    }
    response.send({
      ...picturesResponse,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
