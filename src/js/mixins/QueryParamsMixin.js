import React from 'react';

import Util from '../utils/Util';

function encodeValuesToURIComponents(values) {
  if (Util.isArray(values)) {
    return values.map(function (param) {
      var uriComponent;

      if (Util.isArray(param)) {
        uriComponent =
          param.map(function (segment) {
            return encodeURIComponent(segment).join(':');
          });
      } else {
        uriComponent = param.toString();
      }

      return encodeURIComponent(uriComponent);
    });
  }

  return encodeURIComponent(values);
}

var QueryParamsMixin = {
  contextTypes: {
    router: React.PropTypes.func
  },

  getCurrentPathname: function () {
    let {router} = this.context;
    let pathname = {};

    if (router) {
      pathname = router.getCurrentPathname();
    }

    return pathname;
  },

  getQueryParamObject: function () {
    let {router} = this.context;

    if (!router) {
      return {};
    }

    return router.getCurrentQuery();
  },

  setQueryParam: function (paramKey, paramValue) {
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

  decodeQueryParamArray: function (array) {
    return array.split(':').map(function (segment) {
      return decodeURIComponent(segment);
    });
  }
};

module.exports = QueryParamsMixin;
