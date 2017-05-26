import React, { Component } from "react";

import PatternsBreadcrumbs from "../../components/PatternsBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class HelpFeedbackPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PatternsBreadcrumbs title="Help & Feedback" path="help-feedback" />
          }
        />
        <div>
          Help/Feedback Page
        </div>
      </Page>
    );
  }
}

module.exports = HelpFeedbackPage;
