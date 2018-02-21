const HealthUnit = require("../HealthUnit");
const UnitHealthStatus = require("../../constants/UnitHealthStatus");
const UnitHealthTypes = require("../../constants/UnitHealthTypes");

let thisUnit;

describe("HealthUnit", function() {
  describe("#getHealth", function() {
    it("returns a UnitHealthStatus object", function() {
      var healthItem = new HealthUnit({
        id: "service_manager",
        description: "Service Manager",
        health: 1
      });

      expect(healthItem.getHealth()).toEqual({
        key: "UNHEALTHY",
        title: "Unhealthy",
        sortingValue: 0,
        value: 1,
        classNames: "text-danger"
      });
    });

    it("returns NA when healthType not found", function() {
      var healthItem = new HealthUnit({});
      expect(healthItem.getHealth()).toEqual(
        UnitHealthStatus[UnitHealthTypes.SERVER_NA]
      );
    });
  });

  describe("#getTitle", function() {
    beforeEach(function() {
      thisUnit = new HealthUnit({
        id: "foo",
        name: "Foo Unit",
        health: "0"
      });
    });

    it("returns a string", function() {
      expect(typeof thisUnit.getTitle()).toEqual("string");
    });

    it("returns the name if available", function() {
      expect(thisUnit.getTitle()).toEqual("Foo Unit");
    });

    it("returns pretty print title if name not available", function() {
      thisUnit = new HealthUnit({
        id: "foo",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo");
    });
  });

  describe("#getPrettyPrintID", function() {
    it("removes dcos prefix from ID", function() {
      thisUnit = new HealthUnit({
        id: "dcos-foo",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo");
    });

    it("removes dashes", function() {
      thisUnit = new HealthUnit({
        id: "foo-bar",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dots", function() {
      thisUnit = new HealthUnit({
        id: "foo.bar",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dashes and dots", function() {
      thisUnit = new HealthUnit({
        id: "foo-bar.qqq",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar Qqq");
    });

    it("removes capitalizes DNS", function() {
      thisUnit = new HealthUnit({
        id: "foo-dns-bar",
        health: "0"
      });
      expect(thisUnit.getTitle()).toEqual("Foo DNS Bar");
    });
  });
});
