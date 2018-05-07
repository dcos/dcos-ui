import Item from "#SRC/js/structs/Item";
import VolumeStatus from "../constants/VolumeStatus";
import VolumeProfile from "../constants/VolumeProfile";

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

  getProfile() {
    return this.get("profileName") || VolumeProfile.UNAVAILABLE;
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

  getMounts() {
    return this.get("mounts") || [];
  }
}

module.exports = Volume;
