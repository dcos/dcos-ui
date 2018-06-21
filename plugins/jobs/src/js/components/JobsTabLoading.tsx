import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import Loader from "#SRC/js/components/Loader";

import JobsPage from "./JobsPage";

export default class JobsTabLoading extends React.Component<{}> {
  render() {
    return (
      <JobsPage>
        <Loader />
      </JobsPage>
    );
  }
}
