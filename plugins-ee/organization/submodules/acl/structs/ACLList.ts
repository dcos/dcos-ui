import Item from "#SRC/js/structs/Item";
import List from "#SRC/js/structs/List";

export default class ACLList extends List {
  getItem(rid) {
    return this.getItems().find(item => item.get("rid") === rid);
  }
}

ACLList.type = Item;
