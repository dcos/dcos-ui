import Item from "../../../../../src/js/structs/Item";
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

  /**
   * Get corresponding service id
   *
   * @return {string} service id
   */
  getServiceId() {
    // Parse the task id (e.g. foo_bar.abc-123) to get the corresponding
    // service id parts (foo, bar)
    const parts = this.getId().match(/([^_]+)(?=[_.])/g);

    // Join service id parts and prepend with a slash to form a valid id
    if (parts) {
      return `/${parts.join("/")}`;
    }

    return "";
  }
};
