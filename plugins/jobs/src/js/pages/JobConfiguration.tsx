import PropTypes from "prop-types";
import * as React from "react";

import JobsFormConfig from "../components/JobsFormConfig";

export default function JobConfiguration({ job }) {
  job = JSON.parse(job.json);

  return (
    <div className="container">
      <JobsFormConfig config={job} />
    </div>
  );
}

JobConfiguration.propTypes = {
  job: PropTypes.object.isRequired
};
