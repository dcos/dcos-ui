import DateUtil from "../utils/DateUtil";
import Item from "./Item";

export default class JobTask extends Item {
  getDateStarted() {
    return DateUtil.strToMs(this.get("startedAt"));
  }

  getDateCompleted() {
    return DateUtil.strToMs(this.get("completedAt"));
  }

  getTaskID() {
    return this.get("id");
  }

  getStatus() {
    return this.get("status");
  }
}
