import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../src/js/constants/TransactionTypes";
import { parseIntValue } from "../../../../../../src/js/utils/ReducerUtil";
import Transaction from "../../../../../../src/js/structs/Transaction";

module.exports = {
  JSONParser(state) {
    if (state.container == null || state.container.volumes == null) {
      return [];
    }

    return state.container.volumes
      .filter(item => item.external == null)
      .reduce(function(memo, item, index) {
        /**
         * For the localVolumes we have a special case as all the volumes
         * are present in the `container.volumes` But in this parser we only
         * want to parse the local volumes. which means that we first filter
         * those and only keep local volumes (decision based on if
         * persistent is set). After that we do get all the values even
         * stuff which we do not handle in the form yet. These steps are:
         * 1) Add a new Item to the path with the index equal to index.
         * 2) Set the size from `volume.persistent.size`on the path
         *    `localVolumes.${index}.size`.
         * 3) Set the containerPath from `volume.containerPath on the path
         *    `localVolumes.${index}.containerPath`
         * 4) Set the mode from `volume.mode` on the path
         *    `localVolumes.${index}.mode`
         */
        memo.push(new Transaction(["localVolumes"], index, ADD_ITEM));

        if (item.persistent != null && item.persistent.size != null) {
          memo.push(
            new Transaction(["localVolumes", index, "type"], "PERSISTENT", SET)
          );

          memo.push(
            new Transaction(
              ["localVolumes", index, "size"],
              item.persistent.size,
              SET
            )
          );
        } else {
          memo.push(
            new Transaction(["localVolumes", index, "type"], "HOST", SET)
          );

          memo.push(
            new Transaction(
              ["localVolumes", index, "hostPath"],
              item.hostPath,
              SET
            )
          );
        }

        if (item.containerPath != null) {
          memo.push(
            new Transaction(
              ["localVolumes", index, "containerPath"],
              item.containerPath,
              SET
            )
          );
        }

        if (item.mode != null) {
          memo.push(
            new Transaction(["localVolumes", index, "mode"], item.mode, SET)
          );
        }

        return memo;
      }, []);
  },

  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("localVolumes") !== -1) {
      if (joinedPath === "localVolumes") {
        switch (type) {
          case ADD_ITEM:
            state.push({ containerPath: null, size: null, mode: "RW" });
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET && `localVolumes.${index}.type` === joinedPath) {
        state[index].type = String(value);
      }
      if (type === SET && `localVolumes.${index}.size` === joinedPath) {
        state[index].size = parseIntValue(value);
      }
      if (type === SET && `localVolumes.${index}.mode` === joinedPath) {
        state[index].mode = String(value);
      }
      if (
        type === SET &&
        `localVolumes.${index}.containerPath` === joinedPath
      ) {
        state[index].containerPath = String(value);
      }
      if (type === SET && `localVolumes.${index}.hostPath` === joinedPath) {
        state[index].hostPath = String(value);
      }
    }

    return state;
  }
};
