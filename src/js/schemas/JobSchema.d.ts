import { Docker } from "./job-schema/Docker";
import { General } from "./job-schema/General";
import { Labels } from "./job-schema/Labels";
import { Schedule } from "./job-schema/Schedule";

interface JobSchema {
  type: string;
  properties: {
    general: General;
    schedule: Schedule;
    docker: Docker;
    labels: Labels;
  };
  required: string[];
}

export var JobSchema: JobSchema;
