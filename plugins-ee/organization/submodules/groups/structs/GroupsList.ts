import List from "#SRC/js/structs/List";
import Group from "./Group";

export default class GroupsList extends List {
  static get type() {
    return Group;
  }
}
