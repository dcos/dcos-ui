import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';

class OrganizationPage extends React.Component {
  render() {
    return (
      <Page title="Organization">
        {this.props.children}
      </Page>
    );
  }
}

OrganizationPage.routeConfig = {
  label: 'Organization',
  icon: <Icon id="icon-users-inverse" size="small" family="product" />,
  matches: /^\/organization/
};

module.exports = OrganizationPage;
