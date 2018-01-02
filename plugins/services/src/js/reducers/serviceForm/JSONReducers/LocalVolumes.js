import { ADD_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

module.exports = {
  JSONParser(state) {
    if (state.container == null || state.container.volumes == null) {
      return [];
    }

    return state.container.volumes
      .filter(item => item.hostPath != null || item.persistent != null)
      .reduce(function(memo, item, index) {
        /**
         * For the volumes we have a special case as all the volumes
         * are present in the `container.volumes` But in this parser we only
         * want to parse the local volumes. which means that we first filter
         * those and only keep local volumes (decision based on if
         * persistent or hostPath is set). After that we do get all the values even
         * stuff which we do not handle in the form yet. These steps are:
         * 1) Add a new Item to the path with the index equal to index.
         * 2) Set the size from `volume.persistent.size`on the path
         *    `volumes.${index}.size`.
         * 3) Set the containerPath from `volume.containerPath on the path
         *    `volumes.${index}.containerPath`
         * 4) Set the mode from `volume.mode` on the path
         *    `volumes.${index}.mode`
         */
        memo.push(new Transaction(["volumes"], item, ADD_ITEM));

        if (item.persistent != null && item.persistent.size != null) {
          memo.push(
            new Transaction(["volumes", index, "type"], "PERSISTENT", SET)
          );

          memo.push(
            new Transaction(
              ["volumes", index, "size"],
              item.persistent.size,
              SET
            )
          );
        } else {
          memo.push(new Transaction(["volumes", index, "type"], "HOST", SET));

          memo.push(
            new Transaction(
              ["volumes", index, "hostPath"],
              item.hostPath || "",
              SET
            )
          );
        }

        if (item.containerPath != null) {
          memo.push(
            new Transaction(
              ["volumes", index, "containerPath"],
              item.containerPath,
              SET
            )
          );
        }

        if (item.mode != null) {
          memo.push(
            new Transaction(["volumes", index, "mode"], item.mode, SET)
          );
        }

        return memo;
      }, []);
  }
};
