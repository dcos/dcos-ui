import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class IconsPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<StyleBreadcrumbs title="Icons" path="icons" />}
        />
        <div>
          Icons Page
        </div>
      </Page>
    );
  }
}

module.exports = IconsPage;
