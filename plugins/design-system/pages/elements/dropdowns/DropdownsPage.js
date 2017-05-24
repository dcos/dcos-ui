import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class DropdownsPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/dropdowns/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/dropdowns/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/dropdowns/styles"
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

module.exports = DropdownsPage;
