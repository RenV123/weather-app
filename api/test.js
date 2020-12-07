module.exports = async (request, response) => {
  console.log(request);
  try {
    response.send({
      request: request,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
