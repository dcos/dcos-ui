import Item from "./Item";

export default class Overlay extends Item {
  constructor(options = {}, ...args) {
    // Make sure info is available in Overlay
    if (!options.info) {
      options.info = {};
    }

    super(options, ...args);
  }

  getName() {
    return this.get("info").name;
  }

  getPrefix() {
    return this.get("info").prefix;
  }

  getSubnet() {
    return this.get("info").subnet;
  }

  getPrefix6() {
    return this.get("info").prefix6;
  }

  getSubnet6() {
    return this.get("info").subnet6;
  }
}
