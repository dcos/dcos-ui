import List from './List';
import Item from './Item';

const PAGE_SIZE = 8 * 4096;  // 32kb of data or 8 'pages'
const DEFAULT_OPTIONS = {
  end: -1,
  initialized: false,
  maxFileSize: 250000000,
  start: -1
};

function truncateItemData(itemData, sizeDiff) {
  // Truncate to fit within maxFileSize
  itemData = itemData.substring(sizeDiff);
  // Truncate to first newline
  let newLineIndex = itemData.indexOf('\n') + 1;
  return itemData.substring(newLineIndex);
  // Update currentSize accordingly
}

class LogBuffer extends List {
  constructor(options = {}) {
    super(...arguments);

    this.configuration = Object.assign({}, DEFAULT_OPTIONS);

    Object.keys(DEFAULT_OPTIONS).forEach((key) => {
      if (options.hasOwnProperty(key)) {
        this.configuration[key] = options[key];
      }
    });
  }

  // Public API
  initialize(offset) { // The point we are reading from in the log file
    let end = this.getEnd(); // pointing to end of currently stored log
    let start = this.getStart(); // pointing to start of currently stored log

    // Get the last page of data.
    if (offset > PAGE_SIZE) {
      start = end = offset - PAGE_SIZE;
    } else {
      start = end = 0;
    }

    this.configuration.initialized = true;
    this.configuration.start = start;
    this.configuration.end = end;
  }

  prepend(entry) {
    let data = entry.get('data');
    let offset = entry.get('offset');

    let start = this.getStart();
    let end = this.getEnd();

    // If first entry ever for the LogBuffer.
    if (start === end && offset !== 0) {
      end = offset + data.length;
    }

    start = offset;

    this.list.unshift(new Item({data, start}));
    this.configuration.start = start;
    this.configuration.end = end;

    let fromBack = true;
    this.truncate(fromBack);
  }

  add(entry) {
    let data = entry.get('data');
    let end = this.getEnd();
    // The point we are reading from in the log file
    let offset = entry.get('offset');
    let start = this.getStart();

    // Truncate to the first newline from beginning of received data,
    // if this is the first request and the data received is not from the
    // beginning of the log
    if (start === end && offset !== 0) {
      let index = data.indexOf('\n') + 1;
      offset += index;
      data = data.substring(index);
      start = offset; // Adjust the actual start too!
    }

    // Update end to be offset + new addition to the log
    this.configuration.end = offset + data.length;
    this.configuration.start = start;

    // Add log entry
    super.add(new Item({data, offset}));
    this.truncate();
  }

  getEnd() {
    return this.configuration.end;
  }

  getFullLog() {
    return this.getItems().map(function (item) {
      return item.get('data');
    }).join('');
  }

  getStart() {
    return this.configuration.start;
  }

  isInitialized() {
    return this.configuration.initialized;
  }

  /**
   * Truncates the log from beginning of file, to be within
   * boundaries given by maxFileSize
   * It will also truncate the data of the 'oldest item to stay in log',
   * to the first newline index
   * @param {boolean} fromBack Truncate from front or back.
   */
  truncate(fromBack) {
    let currentSize = this.getEnd() - this.getStart();
    let maxFileSize = this.configuration.maxFileSize;
    let sizeDiff = currentSize - maxFileSize;

    if (sizeDiff <= 0) {
      return;
    }

    let items = this.getItems();

    // This is the index of which item to truncate. If fromBack is not set,
    // truncate the first item. If fromBack is set, truncate the last item.
    let index = 0;
    if (fromBack) {
      index = items.length - 1;
    }

    let item = items[index];
    let itemData = item.get('data');
    let originalDatasize = itemData.length;

    itemData = truncateItemData(itemData, sizeDiff);
    currentSize = currentSize - originalDatasize + itemData.length;

    if (itemData.length > 0) {
      items[index] = new Item({
        data: itemData,
        offset: item.get('offset')
      });
    } else {
      this.list.splice(index, 1);
    }

    if (fromBack) {
      this.configuration.end = this.getStart() + currentSize;
    } else {
      this.configuration.start = this.getEnd() - currentSize;
    }

    if (currentSize > maxFileSize) {
      this.truncate(fromBack);
    }
  }
}

LogBuffer.type = Item;

module.exports = LogBuffer;
