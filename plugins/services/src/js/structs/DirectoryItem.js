import Item from "../../../../../src/js/structs/Item";
import StringUtil from "../../../../../src/js/utils/StringUtil";

const DISPLAY_NAMES = {
  stdout: "Output (stdout)",
  stderr: "Error (stderr)"
};

class DirectoryItem extends Item {
  getDisplayName() {
    const name = this.getName();
    const displayName = DISPLAY_NAMES[name];
    if (displayName) {
      return displayName;
    }

    return StringUtil.capitalize(name);
  }

  getName() {
    return this.get("path").replace(/^.*\//, "");
  }

  isDirectory() {
    // DirectoryItem is a directory if nlink is greater than 1.
    return this.get("nlink") > 1;
  }

  isLogFile() {
    return !this.isDirectory();
  }
}

module.exports = DirectoryItem;
