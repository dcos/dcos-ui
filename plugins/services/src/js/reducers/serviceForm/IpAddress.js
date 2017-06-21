import { SET } from "../../../../../../src/js/constants/TransactionTypes";

module.exports = {
  JSONReducer(state = null, { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");
    if (this.internalState == null) {
      this.internalState = {};
    }

    if (type === SET && joinedPath === "ipAddress.discovery") {
      this.internalState.discovery = value;
    }

    if (type === SET && joinedPath === "ipAddress.groups") {
      this.internalState.groups = value;
    }

    if (type === SET && joinedPath === "ipAddress.labels") {
      this.internalState.labels = value;
    }

    if (type === SET && joinedPath === "container.docker.network") {
      const networkName = value.split(".")[1];
      if (networkName != null) {
        return {
          discovery: this.internalState.discovery || {},
          groups: this.internalState.groups || [],
          labels: this.internalState.labels || {},
          networkName: value.split(".")[1]
        };
      }

      return null;
    }

    return state;
  }
};
