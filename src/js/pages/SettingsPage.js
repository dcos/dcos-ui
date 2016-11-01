import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class SettingsPage extends React.Component {
  render() {
    return (
      <Page title="Settings">
        {this.props.children}
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
