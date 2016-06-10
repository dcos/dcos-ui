import List from './List';
import JobActiveRun from './JobActiveRun';

class JobActiveRunList extends List {
  getLongestRunningActiveRun() {
    let sortedRuns = this.getItems().sort(function (a, b) {
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

JobActiveRunList.type = JobActiveRun;

module.exports = JobActiveRunList;
