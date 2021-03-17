const validOrigins = [
  'weather-app-flame.vercel.app/',
  'weather-app-renv123.vercel.app',
  'weather-app-git-vercel-serverless-functions-renv123.vercel.app',
  'weather-app-git-main.renv123.vercel.app',
  'weather-app-git-main.renv123.vercel.app',
];

/**
 * Validates that the string is from a known origin.
 * @param {String} origin
 * @returns
 */
function validateOriginHeader(origin) {
  return (
    validOrigins.includes(origin) ||
    //Needed for deployment urls to work.
    (origin.startsWith('weather-app-') &&
      origin.endsWith('-renv123.vercel.app'))
  );
}

module.exports = { validateOriginHeader };
