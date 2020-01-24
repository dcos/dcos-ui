import List from "#SRC/js/structs/List";
import ServiceAccount from "./ServiceAccount";

class ServiceAccountList extends List {
  static get type() {
    return ServiceAccount;
  }
}

export default ServiceAccountList;
