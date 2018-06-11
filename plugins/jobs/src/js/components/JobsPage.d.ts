import * as React from 'react';
import JobTree from '#SRC/js/structs/JobTree';

interface JobsPageProps {
  addButton?: any;
  children: any;
  root: JobTree;
  item?: JobTree;
}

export default class JobsPage extends React.Component<JobsPageProps> {}
