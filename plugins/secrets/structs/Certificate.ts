import Item from "#SRC/js/structs/Item";
import DateUtil from "#SRC/js/utils/DateUtil";

const STATUS_MAP = {
  good: "active",
  revoked: "expired"
};

export default class Certificate extends Item {
  set name(nameValue) {
    this._name = nameValue;
  }

  set status(statusValue) {
    this._status = statusValue;
  }

  get name() {
    return this.get("subject").common_name;
  }

  get status() {
    const internalStatus = this.get("status");
    const displayStatus = STATUS_MAP[internalStatus];

    if (displayStatus == null) {
      return internalStatus;
    }

    return displayStatus;
  }

  get expiresAt() {
    const date = new Date(this.get("not_after"));

    return DateUtil.msToRelativeTime(date);
  }
}
