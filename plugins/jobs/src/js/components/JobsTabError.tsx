import * as React from "react";

import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import JobsPage from "./JobsPage";

export default class JobsTabLoading extends React.Component<{}> {
  render() {
    return (
      <JobsPage>
        <RequestErrorMsg />
      </JobsPage>
    );
  }
}
