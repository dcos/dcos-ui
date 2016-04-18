var Link = require('react-router').Link;
var React = require('react');

var AlertPanel = require('../components/AlertPanel');
var Page = require('../components/Page');
var SidebarActions = require('../events/SidebarActions');

var NotFoundPage = React.createClass({

  displayName: 'NotFoundPage',

  statics: {
    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {

      SidebarActions.close();
    }
  },

  render: function () {
    return (
      <Page title="Page Not Found">
        <AlertPanel
          title="Page Not Found">
          <p>
            The page you’ve requested cannot be found.
            It’s possible you copied the wrong link.
            Check again, or jump back to your&nbsp;
            <Link to="dashboard">Dashboard</Link>.
          </p>
        </AlertPanel>
      </Page>
    );
  }

});

module.exports = NotFoundPage;
