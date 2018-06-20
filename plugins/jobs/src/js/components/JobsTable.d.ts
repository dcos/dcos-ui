import * as React from "react";
import Job from "#SRC/js/structs/Job";
import JobTree from "#SRC/js/structs/JobTree";

interface JobsTableProps {
  jobs: Array<JobTree | Job>;
}

export default class JobsTable extends React.Component<JobsTableProps> {}
