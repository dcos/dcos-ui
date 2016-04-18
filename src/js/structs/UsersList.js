import List from './List';
import Item from './Item';

module.exports = class UsersList extends List {
  constructor() {
    super(...arguments);
    // Replace list items with instances of Item.
    this.list = this.list.map(function (item) {
      if (item instanceof Item) {
        return item;
      } else {
        return new Item(item);
      }
    });
  }
};
