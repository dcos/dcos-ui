import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class LoadingPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<PatternsBreadcrumbs title="Loading" path="loading" />}
        />
        <div>
          Loading Page
        </div>
      </Page>
    );
  }
}

module.exports = LoadingPage;
