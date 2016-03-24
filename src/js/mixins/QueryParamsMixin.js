import React from 'react';

import Util from '../utils/Util';

function encodeValuesToURIComponents(values) {
  if (Util.isArray(values)) {
    return values.map((param) => {
      var uriComponent;

      if (Util.isArray(param)) {
        uriComponent =
          param.map(segment => encodeURIComponent(segment)).join(':');
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
    var router = this.context.router;
    var pathName = {};

    if (router) {
      pathName = router.getCurrentPathname();
    }

    return pathName;
  },

  getQueryParamObject: function () {
    var router = this.context.router;
    var queryParamObject = {};

    if (router) {
      queryParamObject = router.getCurrentQuery();
    }

    return queryParamObject;
  },

  getQueryParamValue: function (paramKey) {
    var router = this.context.router;
    var queryParamValue = null;

    if (router) {
      queryParamValue = router.getCurrentQuery()[paramKey];
    }

    return queryParamValue;
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
