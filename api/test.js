module.exports = async (request, response) => {
  console.log(request.body);
  try {
    response.send({
      request: request.body,
    });
  } catch (err) {
    response.send({
      status: 500,
      message: err.message,
    });
  }
};
