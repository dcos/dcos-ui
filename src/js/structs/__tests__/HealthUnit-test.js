jest.dontMock("../../constants/UnitHealthStatus");

const HealthUnit = require("../HealthUnit");
const UnitHealthStatus = require("../../constants/UnitHealthStatus");

describe("HealthUnit", function() {
  describe("#getHealth", function() {
    it("returns a UnitHealthStatus object", function() {
      var healthItem = new HealthUnit({
        id: "service_manager",
        description: "Service Manager",
        health: 1
      });

      expect(healthItem.getHealth()).toEqual({
        title: "Unhealthy",
        value: 1,
        classNames: "text-danger"
      });
    });

    it("returns NA when healthType not found", function() {
      var healthItem = new HealthUnit({});
      expect(healthItem.getHealth()).toEqual(UnitHealthStatus.NA);
    });
  });

  describe("#getTitle", function() {
    beforeEach(function() {
      this.unit = new HealthUnit({
        id: "foo",
        name: "Foo Unit",
        health: "0"
      });
    });

    it("returns a string", function() {
      expect(typeof this.unit.getTitle()).toEqual("string");
    });

    it("returns the name if available", function() {
      expect(this.unit.getTitle()).toEqual("Foo Unit");
    });

    it("returns pretty print title if name not available", function() {
      this.unit = new HealthUnit({
        id: "foo",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo");
    });
  });

  describe("#getPrettyPrintID", function() {
    it("removes dcos prefix from ID", function() {
      this.unit = new HealthUnit({
        id: "dcos-foo",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo");
    });

    it("removes dashes", function() {
      this.unit = new HealthUnit({
        id: "foo-bar",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dots", function() {
      this.unit = new HealthUnit({
        id: "foo.bar",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dashes and dots", function() {
      this.unit = new HealthUnit({
        id: "foo-bar.qqq",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo Bar Qqq");
    });

    it("removes capitalizes DNS", function() {
      this.unit = new HealthUnit({
        id: "foo-dns-bar",
        health: "0"
      });
      expect(this.unit.getTitle()).toEqual("Foo DNS Bar");
    });
  });
});
