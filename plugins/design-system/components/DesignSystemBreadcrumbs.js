import { Link } from "react-router";
import React, { Component } from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

const SDK = require("../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

class DesignSystemBreadcrumbs extends Component {
  getBreadcrumbs() {
    return [
      <Breadcrumb key="main-breadcrumb" title="Design System">
        <BreadcrumbTextContent>
          <Link to="/design-system">
            Design System
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];
  }

  render() {
    return (
      <PageHeaderBreadcrumbs
        iconID="servers"
        breadcrumbs={this.getBreadcrumbs()}
      />
    );
  }
}

module.exports = DesignSystemBreadcrumbs;
