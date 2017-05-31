import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class TypographyPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <StyleBreadcrumbs title="Typography" path="typography" />
          }
        />
        <div>
          Typograph Page
        </div>
      </Page>
    );
  }
}

module.exports = TypographyPage;
