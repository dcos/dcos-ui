import { Trans } from "@lingui/macro";
import { Link } from "react-router";
import React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";

const RepositoriesBreadcrumbs = addButton => {
  const crumbs = [
    <Breadcrumb key={-1} title="Repositories">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/repositories" />}>
          Package Repositories
        </Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Gear}
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
