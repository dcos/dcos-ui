import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import DesignSystemBreadcrumbs
  from "../../../components/DesignSystemBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class TypePage extends Component {
  render() {
    const tabs = [
      {
        label: "Overview",
        routePath: "/ds-components/type/overview"
      },
      {
        label: "Code",
        routePath: "/ds-components/type/code"
      },
      {
        label: "Styles",
        routePath: "/ds-components/type/styles"
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

module.exports = TypePage;
