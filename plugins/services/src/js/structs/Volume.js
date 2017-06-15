import Item from "../../../../../src/js/structs/Item";
import VolumeStatus from "../constants/VolumeStatus";

class Volume extends Item {
  getContainerPath() {
    return this.get("containerPath");
  }

  getHost() {
    return this.get("host");
  }

  getId() {
    return this.get("id");
  }

  getMode() {
    return this.get("mode");
  }

  getStatus() {
    return this.get("status") || VolumeStatus.UNAVAILABLE;
  }

  getSize() {
    return this.get("size");
  }

  getTaskID() {
    return this.get("taskID");
  }

  getType() {
    return this.get("type");
  }
}

module.exports = Volume;
