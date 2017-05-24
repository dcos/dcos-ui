import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class SegmentedBarsPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/segmented-bars/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/segmented-bars/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/segmented-bars/styles"
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

module.exports = SegmentedBarsPage;
