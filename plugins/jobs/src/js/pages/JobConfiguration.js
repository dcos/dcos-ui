import PropTypes from "prop-types";
import React from "react";

import JobsFormConfig from "../components/JobsFormConfig";

export default function JobConfiguration({ job }) {
  job = JSON.parse(job.json);
  const {
    schedules: [schedule],
    ...jobData
  } = job;
  const config = {
    job: jobData,
    schedule
  };

  return (
    <div className="container">
      <JobsFormConfig config={config} />
    </div>
  );
}

JobConfiguration.propTypes = {
  job: PropTypes.object.isRequired
};
