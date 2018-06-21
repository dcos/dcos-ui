import * as React from "react";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";

interface JobsTableProps {
  data: JobConnection;
}

export default class JobsTable extends React.Component<JobsTableProps> {}
