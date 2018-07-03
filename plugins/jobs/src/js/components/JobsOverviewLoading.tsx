import * as React from "react";

import Loader from "#SRC/js/components/Loader";

import JobsPage from "./JobsPage";

const JobsOverviewLoading = () => {
  return (
    <JobsPage>
      <Loader />
    </JobsPage>
  );
};
export default JobsOverviewLoading;
