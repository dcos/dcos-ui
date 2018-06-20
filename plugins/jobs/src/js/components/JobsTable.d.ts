import * as React from "react";
import JobTree from "#SRC/js/structs/JobTree";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";

interface JobsTableProps {
  jobs: Array<JobTree | Job>;
}

export default class JobsTable extends React.Component<JobsTableProps> {}
