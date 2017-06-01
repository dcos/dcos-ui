import Item from "#SRC/js/structs/Item";
import ServiceImages from "../constants/ServiceImages";

module.exports = class Task extends Item {
  getId() {
    return this.get("id") || "";
  }

  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  getName() {
    return this.get("name");
  }
};
