module.exports = async (request, response) => {
  console.log(request.headers);
  try {
    response.send({
      request: request.headers,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
