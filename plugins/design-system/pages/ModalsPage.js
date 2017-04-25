import React, { Component } from "react";

import DesignSystemBreadcrumbs from "../components/DesignSystemBreadcrumbs";

const SDK = require("../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ModalsPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<DesignSystemBreadcrumbs />} />
        <div>
          Modals Page
        </div>
      </Page>
    );
  }
}

module.exports = ModalsPage;
