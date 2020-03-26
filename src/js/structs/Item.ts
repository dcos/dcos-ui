export default class Item {
  _itemData;

  constructor(item = {}) {
    Object.keys(item).forEach((key) => {
      this[key] = item[key];
    });

    this._itemData = item;
  }

  get(key?: string | null) {
    if (key == null) {
      return this._itemData;
    }

    return this._itemData[key];
  }

  toJSON() {
    return this.get();
  }
}
