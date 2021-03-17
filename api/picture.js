require('dotenv').config();
require('./helpers/validateOrigin');
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

module.exports = async (request, response) => {
  try {
    const picturesResponse = await getPicture(
      request.query.query,
      request.query.nr
    );
    if (validateOriginHeader(request.headers['Origin'])) {
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
