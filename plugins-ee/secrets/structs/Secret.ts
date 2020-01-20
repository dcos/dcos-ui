import Item from "#SRC/js/structs/Item";

class Secret extends Item {
  public getAuthor = (): string => this.get("author");
  public getCreatedAt = (): string => this.get("created");
  public getDescription = (): string => this.get("description");
  public getPath = (): string => this.get("path");
  public getStore = (): string => this.get("store");
  public getValue = (): string | File =>
    // Binary secrets have an instance of File as _itemData
    this.isBinary() ? this._itemData : this.get("value");

  public isBinary = () =>
    this.get("contentType") === "application/octet-stream";
}

export { Secret as default };
