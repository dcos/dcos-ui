import * as React from "react";

import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import JobsPage from "./JobsPage";

const JobsOverviewError = () => {
  return (
    <JobsPage>
      <RequestErrorMsg />
    </JobsPage>
  );
};

export default JobsOverviewError;
