import {Link} from 'react-router';
import React from 'react/addons';

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

  getClearLinkForFilter: function (filterQueryParamKey,
      caption = 'Clear',
      className = null) {

    let router = this.context.router;
    let currentPathname = router.getCurrentPathname();
    let query = Object.assign({}, router.getCurrentQuery());
    let params = router.getCurrentParams();

    if (query[filterQueryParamKey] == null ||
        query[filterQueryParamKey].length === 0) {
      return null;
    }

    if (query[filterQueryParamKey] != null) {
      delete query[filterQueryParamKey];
    }

    return (
      <Link className={className}
          to={currentPathname}
          query={query}
          params={params}>
        {caption}
      </Link>
    );
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
