import Item from "#SRC/js/structs/Item";
import ServiceImages from "../constants/ServiceImages";

export default class Task extends Item {
  getId() {
    return this.get("id") || "";
  }

  getImages() {
    return ServiceImages.NA_IMAGES;
  }

  getName() {
    return this.get("name");
  }
}
