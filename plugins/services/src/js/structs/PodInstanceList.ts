import List from "#SRC/js/structs/List";
import PodInstance from "./PodInstance";

export default class PodInstanceList extends List<PodInstance> {
  static type = PodInstance;
}
