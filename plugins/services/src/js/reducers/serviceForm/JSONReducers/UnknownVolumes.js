import { ADD_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

export default {
  JSONParser(state) {
    if (state.container == null || state.container.volumes == null) {
      return [];
    }

    return state.container.volumes
      .filter(function(item) {
        return (
          item.persistent == null &&
          item.external == null &&
          item.hostPath == null &&
          item.mode == null
        );
      })
      .reduce(function(memo, item) {
        return memo.concat(new Transaction(["unknownVolumes"], item, ADD_ITEM));
      }, []);
  }
};
