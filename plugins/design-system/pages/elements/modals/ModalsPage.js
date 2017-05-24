import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ModalsPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/modals/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/modals/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/modals/styles"
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

module.exports = ModalsPage;
