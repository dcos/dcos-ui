import React, { Component } from "react";

import DesignSystemPage from "../../DesignSystemPage";
import ComponentsBreadcrumbs from "../../../components/ComponentsBreadcrumbs";

const SDK = require("../../../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class CheckboxesPage extends Component {
  render() {
    const pathName = "checkboxes";
    const tabs = [
      {
        label: "Overview",
        routePath: `/ds-components/${pathName}/overview`
      },
      {
        label: "Code",
        routePath: `/ds-components/${pathName}/code`
      },
      {
        label: "Styles",
        routePath: `/ds-components/${pathName}/styles`
      }
    ];

    return (
      <DesignSystemPage>
        <Page.Header
          breadcrumbs={
            <ComponentsBreadcrumbs title="Checkboxes" path={pathName} />
          }
          tabs={tabs}
        />
        {this.props.children}
      </DesignSystemPage>
    );
  }
}

module.exports = CheckboxesPage;
