import DateUtil from "../utils/DateUtil";
import Item from "./Item";
import JobTaskList from "./JobTaskList";

class JobRun extends Item {
  getDateCreated() {
    return DateUtil.strToMs(this.get("createdAt"));
  }

  getDateFinished() {
    return DateUtil.strToMs(this.get("finishedAt"));
  }

  getJobID() {
    return this.get("jobId");
  }

  getStatus() {
    return this.get("status");
  }

  getTasks() {
    return new JobTaskList({ items: this.get("tasks") });
  }
}

module.exports = JobRun;
