import React from 'react';

import Icon from '../../../../../src/js/components/Icon';
import Page from '../../../../../src/js/components/Page';

class NodesPage extends React.Component {
  render() {
    return (
      <Page title="Nodes">
        {this.props.children}
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
