const validOrigins = [
  'https://weather-app-flame.vercel.app/',
  'https://weather-app-renv123.vercel.app',
  'https://weather-app-git-vercel-serverless-functions-renv123.vercel.app',
  'https://weather-app-git-main.renv123.vercel.app',
  'https://weather-app-git-main.renv123.vercel.app',
];
function validateOriginHeader(e) {
  return (
    validOrigins.includes(e) ||
    (e.startsWith('weather-app-') && e.endsWith('-renv123.vercel.app'))
  );
}
module.exports = { validateOriginHeader: validateOriginHeader };
