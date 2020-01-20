import List from "#SRC/js/structs/List";
import SecretStoreStruct from "./SecretStoreStruct";

class SecretStoreStructList extends List {
  getSealedCount() {
    return this.getItems().reduce((tally, secretStore) => {
      if (secretStore.getSealed()) {
        return tally + 1;
      }

      return tally;
    }, 0);
  }
}
SecretStoreStructList.type = SecretStoreStruct;

export default SecretStoreStructList;
