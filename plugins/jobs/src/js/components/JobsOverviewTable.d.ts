import * as React from "react";

import { JobConnection } from "../types/JobConnection";

interface JobsOverviewTableProps {
  data: JobConnection;
}

export default class JobsOverviewTable extends React.Component<
  JobsOverviewTableProps
> {}
