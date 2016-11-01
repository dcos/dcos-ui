import React from 'react';
import {routerShape} from 'react-router';

import Icon from '../components/Icon';
import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';

class JobsPage extends React.Component {
  render() {
    let {routes, children} = this.props;
    return (
      <Page
        dontScroll={routes[routes.length - 1].dontScroll}
        title="Jobs">
        {children}
      </Page>
    );
  }
}

JobsPage.contextTypes = {
  router: routerShape
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
