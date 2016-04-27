import React from 'react';
import {RouteHandler} from 'react-router';

import Page from '../components/Page';

var ServicesPage = React.createClass({

  displayName: 'ServicesPage',

  statics: {
    routeConfig: {
      label: 'Services',
      icon: 'services',
      matches: /^\/services/
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  render: function () {
    return (
      <Page title="Services">
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
