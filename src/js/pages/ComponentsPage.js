import {RouteHandler} from 'react-router';
import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class ComponentsPage extends React.Component {
  render() {
    return (
      <Page title="Components">
        <RouteHandler />
      </Page>
    );
  }
}

ComponentsPage.routeConfig = {
  label: 'Components',
  icon: <Icon id="gpu" size="small" family="small" />,
  matches: /^\/components/
};

module.exports = ComponentsPage;
