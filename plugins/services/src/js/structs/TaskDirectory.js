import DirectoryItem from "./DirectoryItem";
import List from "../../../../../src/js/structs/List";

class TaskDirectory extends List {
  findFile(name) {
    return this.getItems().find(function(file) {
      return file.getName() === name;
    });
  }
}

TaskDirectory.type = DirectoryItem;

module.exports = TaskDirectory;
