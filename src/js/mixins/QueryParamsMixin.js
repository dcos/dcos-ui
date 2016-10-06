import React from 'react';

function encodeValuesToURIComponents(values) {
  if (!Array.isArray(values)) {
    return encodeURIComponent(values);
  }

  return values.map(function (param) {
    // Replace commas for nested arrays with semi-colon
    return encodeURIComponent(param).replace(/%2C/g, ';');
  });
}

var QueryParamsMixin = {
  contextTypes: {
    router: React.PropTypes.func
  },

  getCurrentPathname() {
    let {router} = this.context;
    let pathname = {};

    if (router) {
      pathname = router.getCurrentPathname();
    }

    return pathname;
  },

  getQueryParamObject() {
    let {router} = this.context;

    if (!router) {
      return {};
    }

    return router.getCurrentQuery();
  },

  resetQueryParams(params) {
    const {router} = this.context;
    if (!router) {
      return;
    }

    const queryParams = router.getCurrentQuery();
    if (params == null) {
      params = Object.keys(queryParams);
    }

    params.forEach(function (param) {
      delete queryParams[param];
    });

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  setQueryParam(paramKey, paramValue) {
    let {router} = this.context;
    let queryParams = router.getCurrentQuery();

    if (paramValue != null && paramValue.length !== 0) {
      let encodedFilter = encodeValuesToURIComponents(paramValue);

      Object.assign(queryParams, {
        [paramKey]: encodedFilter
      });
    } else {
      delete queryParams[paramKey];
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  decodeQueryParamArray(array) {
    return array.split(';').map(function (segment) {
      return decodeURIComponent(segment);
    });
  }
};

module.exports = QueryParamsMixin;
