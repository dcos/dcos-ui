import Item from "#SRC/js/structs/Item";

export default class ServiceSpec extends Item {
  getId() {
    return this.get("id") || "";
  }

  getResources() {
    return {
      cpus: 0,
      mem: 0,
      gpus: 0,
      disk: 0
    };
  }

  toJSON() {
    return this.get();
  }
}
