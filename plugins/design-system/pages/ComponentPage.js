import React, { Component } from "react";

import DesignSystemPage from "./DesignSystemPage";
import ComponentsBreadcrumbs from "../components/ComponentsBreadcrumbs";

const SDK = require("../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class ComponentPage extends Component {
  render() {
    const { title, pathName } = this.props;

    return (
      <DesignSystemPage>
        <Page.Header
          breadcrumbs={<ComponentsBreadcrumbs title={title} path={pathName} />}
        />
        {this.props.children}
      </DesignSystemPage>
    );
  }
}

module.exports = ComponentPage;
