import { Trans } from "@lingui/macro";
import { Link } from "react-router";
import React from "react";
import createReactClass from "create-react-class";

import AlertPanel from "../components/AlertPanel";
import AlertPanelHeader from "../components/AlertPanelHeader";
import Page from "../components/Page";
import SidebarActions from "../events/SidebarActions";

var NotFoundPage = createReactClass({
  displayName: "NotFoundPage",

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
        <AlertPanel>
          <AlertPanelHeader>
            <Trans render="span">Page not found</Trans>
          </AlertPanelHeader>
          <Trans render="p">
            The page you requested cannot be found. Check the address you
            provided, or head back to the <Link to="/dashboard">Dashboard</Link>
            .
          </Trans>
        </AlertPanel>
      </Page>
    );
  }
});

module.exports = NotFoundPage;
