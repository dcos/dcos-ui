import Item from "#SRC/js/structs/Item";
import { NA_IMAGES } from "../constants/ServiceImages";

export default class Task extends Item {
  getId() {
    return this.get("id") || "";
  }

  getImages() {
    return NA_IMAGES;
  }

  getName() {
    return this.get("name");
  }
}
