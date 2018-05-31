import React, { Component } from "react";

// everything that is references as #ALIAS/something has to be refactored once our DI system is in place
import Loader from "#SRC/js/components/Loader";

import JobsPage from "./JobsPage";

export default class JobsTabLoading extends Component {
  render() {
    const { root } = this.props;

    return (
      <JobsPage root={root}>
        <Loader />
      </JobsPage>
    );
  }
}
