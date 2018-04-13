import { Link } from "react-router";
import React from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";

const RepositoriesBreadcrumbs = addButton => {
  const crumbs = [
    <Breadcrumb key={-1} title="Repositories">
      <BreadcrumbTextContent>
        <Link to="/settings/repositories">Package Repositories</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID="settings"
      breadcrumbs={crumbs}
      addButton={addButton}
    />
  );
};

const RepositoriesPage = ({ addButton, children }) => {
  return (
    <Page>
      <Page.Header
        addButton={addButton}
        breadcrumbs={<RepositoriesBreadcrumbs />}
      />
      {children}
    </Page>
  );
};

export default RepositoriesPage;
