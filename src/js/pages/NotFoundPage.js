import {Link} from 'react-router';
import React from 'react';

import AlertPanel from '../components/AlertPanel';
import Page from '../components/Page';
import SidebarActions from '../events/SidebarActions';

var NotFoundPage = React.createClass({

  displayName: 'NotFoundPage',

  statics: {
    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo() {

      SidebarActions.close();
    }
  },

  render() {
    return (
      <Page title="Page Not Found">
        <AlertPanel
          title="Page Not Found">
          <p>
            The page you’ve requested cannot be found.
            It’s possible you copied the wrong link.
            Check again, or jump back to your&nbsp;
            <Link to="/dashboard">Dashboard</Link>.
          </p>
        </AlertPanel>
      </Page>
    );
  }

});

module.exports = NotFoundPage;
