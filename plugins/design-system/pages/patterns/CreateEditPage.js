import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class CreateEditPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PatternsBreadcrumbs title="Create/Edit" path="create-edit" />
          }
        />
        <div>
          Create Edit Page
        </div>
      </Page>
    );
  }
}

module.exports = CreateEditPage;
