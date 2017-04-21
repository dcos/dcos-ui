var MesosSummaryStore = jest.genMockFromModule("../MesosSummaryStore");

var _data = {};

/**
 * Sets mock data for MesosSummaryStore.get to return.
 * @param {String} key the retrieval key
 * @param {Object} response the data to return for the given key
 * @memberOf __mocks__/MesosSummaryStore
 */
function __setKeyResponse(key, response) {
  _data[key] = response;
}

/**
 * Mocks MesosSummaryStore.get
 * @param {String} key the retrieval key
 * @returns {Object} mock data if present, otherwise an empty object.
 * @memberOf __mocks__/MesosSummaryStore
 */
function get(key) {
  return _data[key];
}

MesosSummaryStore.__setKeyResponse = __setKeyResponse;
MesosSummaryStore.get = get;

module.exports = MesosSummaryStore;
