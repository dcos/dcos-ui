import { JobStatus } from "#SRC/js/events/MetronomeClient";
import List from "./List";
import JobRun from "./JobRun";

interface JobRunItem {
  status: JobStatus;
}
interface JobRunSchedule {}
export default class JobRunList extends List {
  constructor(options: object);
  getItems(): JobRunItem[];
  getLongestRunningActiveRun(): JobRunItem;
  getLongestRunningActiveRun(): JobRun;
}
