import {RouteHandler} from 'react-router';
import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class SettingsPage extends React.Component {
  render() {
    return (
      <Page title="Settings">
        <RouteHandler />
      </Page>
    );
  }
}

SettingsPage.routeConfig = {
  label: 'Settings',
  icon: <Icon id="gears" size="small" family="small" />,
  matches: /^\/settings/
};

module.exports = SettingsPage;
