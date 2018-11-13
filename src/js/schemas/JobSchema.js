/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import Container from "./job-schema/Container";
import General from "./job-schema/General";
import Labels from "./job-schema/Labels";
import Schedule from "./job-schema/Schedule";
import Parameters from "./job-schema/Parameters";

const JobSchema = {
  type: "object",
  properties: {
    general: General,
    schedule: Schedule,
    container: Container,
    docker_parameters: Parameters,
    labels: Labels
  },
  required: ["general"]
};

module.exports = JobSchema;
