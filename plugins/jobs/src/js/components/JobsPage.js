import * as React from "react";

import Page from "#SRC/js/components/Page";

// import JobsBreadcrumbs from "./JobsBreadcrumbs";

export default class JobsPage extends React.Component {
  render() {
    const { addButton, children, namespace } = this.props;

    return (
      <Page>
        <Page.Header
          addButton={addButton}
          breadcrumbs={<div>{(namespace || []).join(".")}</div>}
        />
        {children}
      </Page>
    );
  }
}
