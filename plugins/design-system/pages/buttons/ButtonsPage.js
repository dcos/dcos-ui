import React, { Component } from "react";

import DesignSystemPage from "../../components/DesignSystemPage";
import DesignSystemBreadcrumbs from "../../components/DesignSystemBreadcrumbs";

const SDK = require("../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ButtonsPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/buttons/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/buttons/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/buttons/styles"
      }
    ];

    return (
      <DesignSystemPage>
        <Page.Header breadcrumbs={<DesignSystemBreadcrumbs />} tabs={tabs} />
        {this.props.children}
      </DesignSystemPage>
    );
  }
}

module.exports = ButtonsPage;
