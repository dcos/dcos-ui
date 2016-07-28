module.exports = class Item {
  constructor(item = {}) {
    Object.keys(item).forEach(function (key) {
      this[key] = item[key];
    }, this);

    this._itemData = item;
  }

  toJSON() {
    return JSON.stringify(this._itemData);
  }
  get(key) {
    if (key == null) {
      return this._itemData;
    }

    return this._itemData[key];
  }
};
