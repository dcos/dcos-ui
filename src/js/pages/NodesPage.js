import {RouteHandler} from 'react-router';
import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class NodesPage extends React.Component {
  render() {
    return (
      <Page title="Nodes">
        <RouteHandler />
      </Page>
    );
  }
}

NodesPage.routeConfig = {
  label: 'Nodes',
  icon: <Icon id="servers-inverse" size="small" family="small" />,
  matches: /^\/nodes/
};

module.exports = NodesPage;
