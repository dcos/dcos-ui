import * as React from "react";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";

interface JobsPageProps {
  addButton?: any;
  children: any;
  namespace?: string[];
}

export default class JobsPage extends React.Component<JobsPageProps> {}
