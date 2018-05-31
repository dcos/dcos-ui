import React from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import Page from "#SRC/js/components/Page";

import JobsBreadcrumbs from "./JobsBreadcrumbs";

const JobsPage = ({ addButton, children, root, item }) => {
  return (
    <Page>
      <Page.Header
        addButton={addButton}
        breadcrumbs={<JobsBreadcrumbs tree={root} item={item} />}
      />
      {children}
    </Page>
  );
};

export default JobsPage;
