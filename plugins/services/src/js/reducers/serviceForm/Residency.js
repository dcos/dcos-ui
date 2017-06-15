import Transaction from "../../../../../../src/js/structs/Transaction";
import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from "../../../../../../src/js/constants/TransactionTypes";

module.exports = {
  JSONReducer(state, { type, path, value }) {
    if (this.localVolumes == null) {
      this.localVolumes = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("localVolumes") !== -1) {
      if (joinedPath === "localVolumes") {
        switch (type) {
          case ADD_ITEM:
            this.localVolumes.push(false);
            break;
          case REMOVE_ITEM:
            this.localVolumes = this.localVolumes.filter((item, index) => {
              return index !== value;
            });
            break;
        }
      }
      const index = path[1];
      if (type === SET && `localVolumes.${index}.type` === joinedPath) {
        this.localVolumes[index] = value === "PERSISTENT";
      }

      const hasLocalVolumes = this.localVolumes.find(value => {
        return value;
      });
      if (hasLocalVolumes && this.residency == null) {
        return {
          relaunchEscalationTimeoutSeconds: 10,
          taskLostBehavior: "WAIT_FOREVER"
        };
      } else if (!hasLocalVolumes) {
        return;
      } else {
        return this.residency;
      }
    }
    if (type === SET && joinedPath === "residency") {
      this.residency = value;

      return value;
    }

    return state;
  },
  JSONParser(state) {
    if (state.residency == null) {
      return [];
    }

    return new Transaction(["residency"], state.residency);
  }
};
