import * as React from "react";

import Page from "#SRC/js/components/Page";

import Breadcrumbs from "./Breadcrumbs";

export default class JobsPage extends React.Component {
  render() {
    const { addButton, children, jobPath } = this.props;

    return (
      <Page>
        <Page.Header
          addButton={addButton}
          breadcrumbs={<Breadcrumbs jobPath={jobPath} />}
        />
        {children}
      </Page>
    );
  }
}
