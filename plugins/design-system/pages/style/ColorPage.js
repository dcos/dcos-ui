import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ColorPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<StyleBreadcrumbs title="Color" path="color" />}
        />
        <div>
          Color Page
        </div>
      </Page>
    );
  }
}

module.exports = ColorPage;
