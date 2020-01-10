import List from "#SRC/js/structs/List";
import PodTerminationHistory from "./PodTerminationHistory";

export default class PodTerminationHistoryList extends List<
  PodTerminationHistory
> {
  static type = PodTerminationHistory;
}
