var UserSettingsStore = jest.genMockFromModule("../UserSettingsStore");

var _data = {};

/**
 * Sets mock data for UserSettingsStore.getKey to return.
 * @param {String} key the retrieval key
 * @param {Object} response the data to return for the given key
 * @memberOf __mocks__/UserSettingsStore
 */
function __setKeyResponse(key, response) {
  _data[key] = response;
}

/**
 * Clears all mock data from the UserSettingsStore.
 * @memberOf __mocks__/UserSettingsStore
 */
function __reset() {
  _data = {};
}

/**
 * Mocks UserSettingsStore.getKey
 * @param {String} key the retrieval key
 * @returns {Object} mock data if present, otherwise an empty object.
 * @memberOf __mocks__/UserSettingsStore
 */
function getKey(key) {
  if (_data[key] == null) {
    return {};
  }

  return _data[key];
}

UserSettingsStore.__setKeyResponse = __setKeyResponse;
UserSettingsStore.__reset = __reset;
UserSettingsStore.getKey = getKey;

module.exports = UserSettingsStore;
