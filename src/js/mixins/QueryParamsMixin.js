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
    router: React.PropTypes.object
  },

  getCurrentPathname() {
    let {pathname} = this.props.location;
    return pathname || {};
  },

  getQueryParamObject() {
    let {query} = this.props.location;
    return query || {};
  },

  resetQueryParams(params) {
    let {router} = this.context;
    if (!router) {
      return;
    }

    let {location} = this.props;
    let query = Object.assign({}, location.query);

    if (params == null) {
      params = Object.keys(query);
    }

    params.forEach(function (param) {
      delete query[param];
    });

    router.push({pathname: location.pathname, query});
  },

  setQueryParam(paramKey, paramValue) {
    let {router} = this.context;
    let {location} = this.props;
    let query = Object.assign({}, location.query);

    if (paramValue != null && paramValue.length !== 0) {
      let encodedFilter = encodeValuesToURIComponents(paramValue);

      query = Object.assign(query, {
        [paramKey]: encodedFilter
      });
    } else {
      delete query[paramKey];
    }

    router.push({pathname: location.pathname, query});
  },

  decodeQueryParamArray(array) {
    return array.split(';').map(function (segment) {
      return decodeURIComponent(segment);
    });
  }
};

module.exports = QueryParamsMixin;
