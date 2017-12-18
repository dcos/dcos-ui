import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";
import VolumeConstants from "../../../constants/VolumeConstants";

module.exports = {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.volumeMounts == null) {
      this.volumeMounts = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("volumeMounts") !== -1) {
      if (joinedPath === "volumeMounts") {
        switch (type) {
          case ADD_ITEM:
            this.volumeMounts.push(false);
            break;
          case REMOVE_ITEM:
            this.volumeMounts = this.volumeMounts.filter((item, index) => {
              return index !== value;
            });
            break;
        }
      }
      const index = path[1];
      if (type === SET && `volumeMounts.${index}.type` === joinedPath) {
        this.volumeMounts[index] =
          value === VolumeConstants.type.localPersistent;
      }

      const hasLocalVolumes = this.volumeMounts.find(value => {
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
    const residency = findNestedPropertyInObject(state, "scheduling.residency");
    if (residency == null) {
      return [];
    }

    return new Transaction(["residency"], residency);
  }
};
