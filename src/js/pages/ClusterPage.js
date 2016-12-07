import React from 'react';

import Icon from '../components/Icon';

class ClusterPage extends React.Component {
  render() {
    return this.props.children;
  }
}

ClusterPage.routeConfig = {
  label: 'Cluster',
  icon: <Icon id="cluster-inverse" size="small" family="product" />,
  matches: /^\/cluster/
};

module.exports = ClusterPage;
