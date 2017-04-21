var QueryParamsMixin = jest.genMockFromModule("../QueryParamsMixin");

var _data = {};

/**
 * Sets mock data for QueryParamsMixin.
 * @param {Object} data the whole query params object
 * @memberOf __mocks__/QueryParamsMixin
 */
function __setData(data) {
  _data = data;
}

/**
 * Mocks QueryParamsMixin.getQueryParamObject.
 * @returns {Object} mock data
 */
function getQueryParamObject() {
  return _data;
}

// This has to be done in a mock in order to be available at mixin time
QueryParamsMixin.setQueryParam = jasmine.createSpy("setQueryParam");

QueryParamsMixin.__setData = __setData;
QueryParamsMixin.getQueryParamObject = getQueryParamObject;

module.exports = QueryParamsMixin;
