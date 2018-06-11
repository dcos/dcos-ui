import List from "./List";
import JobRun from "./JobRun";

export default class JobRunList extends List {
  getLongestRunningActiveRun(): JobRun;
}
