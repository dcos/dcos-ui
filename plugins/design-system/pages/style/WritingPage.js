import React, { Component } from "react";

import DesignSystemBreadcrumbs from "../../components/DesignSystemBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class WritingPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<DesignSystemBreadcrumbs />} />
        <div>
          Writing Page
        </div>
      </Page>
    );
  }
}

module.exports = WritingPage;
