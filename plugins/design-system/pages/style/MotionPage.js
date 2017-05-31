import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class MotionPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<StyleBreadcrumbs title="Motion" path="motion" />}
        />
        <div>
          Motion Page
        </div>
      </Page>
    );
  }
}

module.exports = MotionPage;
