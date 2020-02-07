import Item from "#SRC/js/structs/Item";

export default class SecretStoreStruct extends Item {
  getDescription() {
    return this.get("description");
  }

  getDriver() {
    return this.get("driver");
  }

  getInitialized() {
    return this.get("initialized");
  }

  getSealed() {
    return this.get("sealed");
  }
}
