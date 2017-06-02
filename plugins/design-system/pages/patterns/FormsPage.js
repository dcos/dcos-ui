import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class FormsPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<PatternsBreadcrumbs title="Forms" path="forms" />}
        />
        <div>
          Forms Page
        </div>
      </Page>
    );
  }
}

module.exports = FormsPage;
