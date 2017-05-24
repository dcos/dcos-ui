import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class TablesPage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/tables/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/tables/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/tables/styles"
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

module.exports = TablesPage;
