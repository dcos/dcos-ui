import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class NotificationsPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PatternsBreadcrumbs title="Notifications" path="notifications" />
          }
        />
        <div>
          Notifications Page
        </div>
      </Page>
    );
  }
}

module.exports = NotificationsPage;
