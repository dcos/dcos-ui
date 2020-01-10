import List from "#SRC/js/structs/List";

import DirectoryItem from "./DirectoryItem";

export default class TaskDirectory extends List<DirectoryItem> {
  static type = DirectoryItem;
  findFile(name) {
    return this.getItems().find(file => file.getName() === name);
  }
}
