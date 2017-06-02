import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ValidationPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PatternsBreadcrumbs title="Validation" path="validation" />
          }
        />
        <div>
          Validation Page
        </div>
      </Page>
    );
  }
}

module.exports = ValidationPage;
