import rp from 'request-promise';
import querystring from 'querystring';

function mergeOptions(opts) {
  const headers = Object.assign({}, opts.headers || {});
  const options = Object.assign({}, {
    json: true,
    resolveWithFullResponse: true
  }, opts);

  options.headers = headers;

  return options;
}

/**
 * Fetches a number of urls and returns responses as an array once resolved
 * @param  {array} urls    array of urls to resolve
 * @param  {Object} options request options
 * @return {promise}         promise which resolves all responses for requests
 */
export function fetch(urls, options={}) {
  options = mergeOptions(options);

  const promises = urls.map((url = '') => {
    if (options.baseURI) {
      url = options.baseURI + url;
      delete options.baseURI;
    }

    if (options.query) {
      url = `${url}?${querystring.stringify(options.query)}`;
      delete options.query;
    }

    return new Promise((resolve, reject) => {
      const mergedOptions = Object.assign({}, options, {
        uri: url
      });

      rp(mergedOptions)
      .then((response) => resolve(response.body))
      .catch((err) => reject(err));
    });
  });

  return Promise.all(promises);
};

/**
 * Fetch RESTful resources with an authToken
 * @param  {string} authToken JWT
 * @param  {object} options   options passed to http request
 * @return {function}           function that excepts array of urls to resolve
 */
export function fetchWithAuth(authToken, options) {
  return function (urls) {
    options.headers = Object.assign({}, options.headers || {}, {
      Cookie: authToken
    });

    return fetch(urls, options);
  };
};
