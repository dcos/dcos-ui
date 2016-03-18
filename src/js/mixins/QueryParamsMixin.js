import React from 'react';

import Util from '../utils/Util';

function encodeValuesToURIComponents(values) {
  if (Util.isArray(values)) {
    return values.map((param) => {
      var uriComponent = Util.isArray(param)
        ? param.map(segment => encodeURIComponent(segment)).join(':')
        : param.toString();

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
    var router = this.context.router;
    return router
      ? router.getCurrentPathname()
      : {};
  },

  getQueryParamObject: function () {
    var router = this.context.router;
    return router
      ? router.getCurrentQuery()
      : {};
  },

  getQueryParamValue: function (paramKey) {
    var router = this.context.router;
    return router
      ? router.getCurrentQuery()[paramKey]
      : null;
  },

  setQueryParam: function (paramKey, paramValue) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

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
    return array.split(':').map(segment => decodeURIComponent(segment));
  }
};

export default QueryParamsMixin;
