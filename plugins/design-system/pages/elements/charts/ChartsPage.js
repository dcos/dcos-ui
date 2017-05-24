import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ChartsPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/charts/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/charts/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/charts/styles"
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

module.exports = ChartsPage;
