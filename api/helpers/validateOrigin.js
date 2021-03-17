const validOrigins = [
  'https://weather-app-flame.vercel.app/',
  'https://weather-app-renv123.vercel.app',
  'https://weather-app-git-vercel-serverless-functions-renv123.vercel.app',
  'https://weather-app-git-main.renv123.vercel.app',
  'https://weather-app-git-main.renv123.vercel.app',
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
    (origin.startsWith('https://weather-app-') &&
      origin.endsWith('-renv123.vercel.app'))
  );
}

export default validateOriginHeader;
