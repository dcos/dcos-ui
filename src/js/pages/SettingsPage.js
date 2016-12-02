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
  icon: <Icon id="gear-inverse" size="small" family="product" />,
  matches: /^\/settings/
};

module.exports = SettingsPage;
