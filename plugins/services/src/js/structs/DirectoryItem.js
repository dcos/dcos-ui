import Item from "#SRC/js/structs/Item";
import StringUtil from "#SRC/js/utils/StringUtil";

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

export default DirectoryItem;
