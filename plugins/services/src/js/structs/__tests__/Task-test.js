import Task from "../Task";

const ServiceImages = require("../../constants/ServiceImages");

describe("Task", () => {
  describe("#getId", () => {
    it("returns correct id", () => {
      const task = new Task({
        id: "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
      });

      expect(task.getId()).toEqual("test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76");
    });

    it("returns empty string if id is undefined", () => {
      const task = new Task({});

      expect(task.getId()).toEqual("");
    });
  });

  describe("#getImages", () => {
    it("defaults to NA images", () => {
      const task = new Task({});

      expect(task.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#geName", () => {
    it("returns correct name", () => {
      const task = new Task({
        id: "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76",
        name: "foo.bar.baz"
      });

      expect(task.getName()).toEqual("foo.bar.baz");
    });
  });
});
