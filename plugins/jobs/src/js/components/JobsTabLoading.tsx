import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import Loader from "#SRC/js/components/Loader";
// tslint:disable-next-line:no-submodule-imports
import JobTree from "#SRC/js/structs/JobTree";

import JobsPage from "./JobsPage";

interface JobsTabLoadingProps {
  root?: JobTree;
}

export default class JobsTabLoading extends React.Component<
  JobsTabLoadingProps
> {
  render() {
    const { root } = this.props;

    return (
      <JobsPage
        root={root || new JobTree({})} // only for breadcrumb -> removed / replaced with "root"
      >
        <Loader />
      </JobsPage>
    );
  }
}
