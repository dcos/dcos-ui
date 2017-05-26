import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class LayoutPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<StyleBreadcrumbs title="Layout" path="layout" />}
        />
        <div>
          Layout Page
        </div>
      </Page>
    );
  }
}

module.exports = LayoutPage;
