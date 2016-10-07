import React from 'react';

import Icon from '../components/Icon';
import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';

class JobsPage extends React.Component {
  render() {
    let routes = this.context.router.getCurrentRoutes();

    return (
      <Page
        dontScroll={routes[routes.length - 1].dontScroll}
        title="Jobs">
        {this.props.children}
      </Page>
    );
  }
}

JobsPage.contextTypes = {
  router: React.PropTypes.func
};

JobsPage.routeConfig = {
  label: 'Jobs',
  icon: <Icon id="pages-code-inverse" size="small" family="small" />,
  matches: /^\/jobs/
};

JobsPage.willTransitionTo = function () {
  SidebarActions.close();
};

module.exports = JobsPage;
