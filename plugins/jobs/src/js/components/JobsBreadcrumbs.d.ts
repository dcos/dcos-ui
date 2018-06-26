import { Component } from "react";
import JobTree from "#SRC/js/structs/JobTree";
import Job from "#SRC/js/structs/Job";
import { JobTaskStatus } from "#PLUGINS/jobs/src/js/types/JobTaskStatus";
import { Job as JobType } from "#PLUGINS/jobs/src/js/types/Job";

interface JobSchedule {
  enabled: boolean;
  cron: string;
}

export default class JobsBreadcrumbs extends Component {
  props: {
    item: Partial<JobType>;
    children?: JSX.Element;
  };
}
