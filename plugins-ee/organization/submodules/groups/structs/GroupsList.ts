import List from "#SRC/js/structs/List";
import Group from "./Group";

class GroupsList extends List {
  static get type() {
    return Group;
  }
}

export default GroupsList;
