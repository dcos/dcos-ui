import * as React from "react";
import Job from "#SRC/js/structs/Job";

interface JobsTableProps {
  jobs: Job[];
}

export default class JobsTable extends React.Component<JobsTableProps> {}
