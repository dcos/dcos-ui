import {RouteHandler} from 'react-router';
import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class ClusterPage extends React.Component {
  render() {
    return (
      <Page title="Cluster">
        <RouteHandler />
      </Page>
    );
  }
}

ClusterPage.routeConfig = {
  label: 'Cluster',
  icon: <Icon id="network" size="small" family="small" />,
  matches: /^\/cluster/
};

module.exports = ClusterPage;
