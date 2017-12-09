import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

module.exports = {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.volumes == null) {
      this.volumes = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("volumes") !== -1) {
      if (joinedPath === "volumes") {
        switch (type) {
          case ADD_ITEM:
            this.volumes.push(false);
            break;
          case REMOVE_ITEM:
            this.volumes = this.volumes.filter((item, index) => {
              return index !== value;
            });
            break;
        }
      }
      const index = path[1];
      if (type === SET && `volumes.${index}.type` === joinedPath) {
        this.volumes[index] = value === "PERSISTENT";
      }

      const hasVolumes = this.volumes.find(value => {
        return value;
      });
      if (hasVolumes && this.residency == null) {
        return {
          relaunchEscalationTimeoutSeconds: 10,
          taskLostBehavior: "WAIT_FOREVER"
        };
      } else if (!hasVolumes) {
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
