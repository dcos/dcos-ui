import React, { Component } from "react";

import StyleBreadcrumbs from "../../components/StyleBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class WritingPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<StyleBreadcrumbs title="Writing" path="writing" />}
        />
        <div>
          Writing Page
        </div>
      </Page>
    );
  }
}

module.exports = WritingPage;
