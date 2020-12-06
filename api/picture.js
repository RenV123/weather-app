require("dotenv").config();
const axios = require("axios");

const unsplashAPI = axios.create({
  baseURL: "https://api.unsplash.com/",
  headers: {
    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
  },
});

/*Unsplash API calls */
async function getPicture(query, nrOfPictures) {
  var response = await unsplashAPI.get(
    `/search/photos?query=${query}&per_page=${nrOfPictures}&orientation=landscape`
  );
  //TODO: add some validation
  return response.data.results;
}

module.exports = async (request, response) => {
  try {
    const picturesResponse = await getPicture(
      request.query.query,
      request.query.nr
    );
    response.send({
      status: 200,
      results: picturesResponse,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
