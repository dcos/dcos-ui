const ServiceImages = require("../../constants/ServiceImages");
const Task = require("../Task");

describe("Task", function() {
  describe("#getId", function() {
    it("returns correct id", function() {
      const task = new Task({
        id: "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
      });

      expect(task.getId()).toEqual("test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76");
    });

    it("returns empty string if id is undefined", function() {
      const task = new Task({});

      expect(task.getId()).toEqual("");
    });
  });

  describe("#getImages", function() {
    it("defaults to NA images", function() {
      const task = new Task({});

      expect(task.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });
  });

  describe("#geName", function() {
    it("returns correct name", function() {
      const task = new Task({
        id: "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76",
        name: "foo.bar.baz"
      });

      expect(task.getName()).toEqual("foo.bar.baz");
    });
  });

  describe("#getServiceId", function() {
    it("returns correct service id for a service in root", function() {
      const task = new Task({
        id: "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
      });

      expect(task.getServiceId()).toEqual("/test");
    });

    it("returns correct service id for a service in a group", function() {
      const task = new Task({
        id: "group_test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
      });

      expect(task.getServiceId()).toEqual("/group/test");
    });

    it("returns empty string if id is undefined", function() {
      const task = new Task({});

      expect(task.getServiceId()).toEqual("");
    });
  });
});
