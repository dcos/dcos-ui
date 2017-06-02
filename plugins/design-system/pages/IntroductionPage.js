import React, { Component } from "react";
import { Link } from "react-router";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";

const SDK = require("../SDK").getSDK();

const { Page } = SDK.get(["Page"]);

const IntroductionBreadcrumbs = () => {
  const title = "Introduction";
  const crumbs = [
    <Breadcrumb key={0} title={title}>
      <BreadcrumbTextContent>
        <Link to="/ds-introduction">{title}</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="services" breadcrumbs={crumbs} />;
};

class IntroductionPage extends Component {
  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<IntroductionBreadcrumbs />} />
        <div>
          Introduction Page
        </div>
      </Page>
    );
  }
}

module.exports = IntroductionPage;
