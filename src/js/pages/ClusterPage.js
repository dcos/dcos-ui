import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class ClusterPage extends React.Component {
  render() {
    return (
      <Page title="Cluster">
        {this.props.children}
      </Page>
    );
  }
}

ClusterPage.routeConfig = {
  label: 'Cluster',
  icon: <Icon id="icon-cluster-inverse" size="small" family="product" />,
  matches: /^\/cluster/
};

module.exports = ClusterPage;
