import Item from './Item';
import StringUtil from '../utils/StringUtil';

const DISPLAY_NAMES = {
  'stdout': 'Output',
  'stderr': 'Error'
};

class DirectoryItem extends Item {
  getDisplayName() {
    let name = this.getName();
    let displayName = DISPLAY_NAMES[name];
    if (displayName) {
      return displayName;
    }

    return StringUtil.capitalize(name);
  }

  getName() {
    return this.get('path').replace(/^.*\//, '');
  }

  isDirectory() {
    // DirectoryItem is a directory if nlink is greater than 1.
    return this.get('nlink') > 1;
  }

  isLogFile() {
    let name = this.getName();

    return !this.isDirectory() && (
      DISPLAY_NAMES[name] !== undefined ||
      name.slice(name.length - 4, name.length) === '.log'
    );
  }
}

module.exports = DirectoryItem;
