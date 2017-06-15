import List from "./List";
import JobRun from "./JobRun";

class JobRunList extends List {
  getLongestRunningActiveRun() {
    const sortedRuns = this.getItems().sort(function(a, b) {
      if (a.getDateCreated() == null && b.getDateCreated() == null) {
        return 0;
      }

      if (a.getDateCreated() == null) {
        return 1;
      }

      if (b.getDateCreated() == null) {
        return -1;
      }

      return a.getDateCreated() - b.getDateCreated();
    });

    return sortedRuns[0];
  }
}

JobRunList.type = JobRun;

module.exports = JobRunList;
