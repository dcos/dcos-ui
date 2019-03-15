import List from "#SRC/js/structs/List";

import DirectoryItem from "./DirectoryItem";

class TaskDirectory extends List {
  findFile(name) {
    return this.getItems().find(function(file) {
      return file.getName() === name;
    });
  }
}

TaskDirectory.type = DirectoryItem;

export default TaskDirectory;
