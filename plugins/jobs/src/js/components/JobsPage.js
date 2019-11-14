import * as React from "react";

import Page from "#SRC/js/components/Page";

import Breadcrumbs from "./Breadcrumbs";

export default props => (
  <Page>
    <Page.Header
      addButton={props.addButton}
      breadcrumbs={<Breadcrumbs jobPath={props.jobPath} />}
    />
    {props.children}
  </Page>
);
