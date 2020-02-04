import List from "#SRC/js/structs/List";
import ServiceAccount from "./ServiceAccount";

export default class ServiceAccountList extends List {
  static get type() {
    return ServiceAccount;
  }
}
