var MarathonStore = jest.genMockFromModule("../MarathonStore");

var _data = {};

/**
 * Sets mock data for MarathonStore.get to return.
 * @param {String} key the retrieval key
 * @param {Object} response the data to return for the given key
 * @memberOf __mocks__/MarathonStore
 */
function __setKeyResponse(key, response) {
  _data[key] = response;
}

/**
 * Mocks MarathonStore.get
 * @param {String} key the retrieval key
 * @returns {Object} mock data if present, otherwise an empty object.
 * @memberOf __mocks__/MarathonStore
 */
function get(key) {
  return _data[key];
}

MarathonStore.__setKeyResponse = __setKeyResponse;
MarathonStore.get = get;

module.exports = MarathonStore;
