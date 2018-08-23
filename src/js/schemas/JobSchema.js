/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import Docker from "./job-schema/Docker";
import General from "./job-schema/General";
import Labels from "./job-schema/Labels";
import Schedule from "./job-schema/Schedule";
import Parameters from "./job-schema/Parameters";

const JobSchema = {
  type: "object",
  properties: {
    general: General,
    schedule: Schedule,
    docker: Docker,
    docker_parameters: Parameters,
    labels: Labels
  },
  required: ["general"]
};

module.exports = JobSchema;
