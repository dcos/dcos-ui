import { ADD_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

export function UnknownVolumesJSONParser(state) {
  if (state.container == null || state.container.volumes == null) {
    return [];
  }

  return state.container.volumes
    .filter(
      (item) =>
        item.persistent == null &&
        item.external == null &&
        item.hostPath == null &&
        item.mode == null
    )
    .reduce(
      (memo, item) =>
        memo.concat(new Transaction(["unknownVolumes"], item, ADD_ITEM)),
      []
    );
}
