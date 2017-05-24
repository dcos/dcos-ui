import React, { Component } from "react";

import DesignSystemBreadcrumbs from "../../components/DesignSystemBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class NotificationsPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<DesignSystemBreadcrumbs />} />
        <div>
          Notifications Page
        </div>
      </Page>
    );
  }
}

module.exports = NotificationsPage;
