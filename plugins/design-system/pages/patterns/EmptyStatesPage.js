import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class EmptyStatesPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PatternsBreadcrumbs title="Empty States" path="empty-states" />
          }
        />
        <div>
          Empty States Page
        </div>
      </Page>
    );
  }
}

module.exports = EmptyStatesPage;
