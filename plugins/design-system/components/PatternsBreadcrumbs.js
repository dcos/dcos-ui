import { Link } from "react-router";
import React, { Component } from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

class PatternsBreadcrumbs extends Component {
  getBreadcrumbs(title, path) {
    return [
      <Breadcrumb key="main-breadcrumb" title={title}>
        <BreadcrumbTextContent>
          <Link to={`/ds-patterns/${path}`}>
            {title}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];
  }

  render() {
    const { title, path } = this.props;

    return (
      <PageHeaderBreadcrumbs
        iconID="packages"
        breadcrumbs={this.getBreadcrumbs(title, path)}
      />
    );
  }
}

module.exports = PatternsBreadcrumbs;
