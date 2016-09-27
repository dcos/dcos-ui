import {RouteHandler} from 'react-router';
import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class OrganizationPage extends React.Component {
  render() {
    return (
      <Page title="Organization">
        <RouteHandler />
      </Page>
    );
  }
}

OrganizationPage.routeConfig = {
  label: 'Organization',
  icon: <Icon id="users" size="small" family="small" />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
