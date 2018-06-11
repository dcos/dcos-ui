import * as React from "react";

import Page from "#SRC/js/components/Page";

import JobsBreadcrumbs from "./JobsBreadcrumbs";

export default class JobsPage extends React.Component {
  render() {
    const { addButton, children, root, item } = this.props;

    return (
      <Page>
        <Page.Header
          addButton={addButton}
          breadcrumbs={<JobsBreadcrumbs tree={root} item={item} />}
        />
        {children}
      </Page>
    );
  }
}
