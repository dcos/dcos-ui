import UnitHealthStatus from "../../constants/UnitHealthStatus";
import HealthUnit from "../HealthUnit";
import UnitHealthTypes from "../../constants/UnitHealthTypes";

let thisUnit;

describe("HealthUnit", () => {
  describe("#getHealth", () => {
    it("returns a UnitHealthStatus object", () => {
      const healthItem = new HealthUnit({
        id: "service_manager",
        description: "Service Manager",
        health: 1,
      });

      expect(healthItem.getHealth()).toEqual({
        key: "UNHEALTHY",
        title: "Unhealthy",
        sortingValue: 0,
        value: 1,
        classNames: "text-danger",
      });
    });

    it("returns NA when healthType not found", () => {
      const healthItem = new HealthUnit({});
      expect(healthItem.getHealth()).toEqual(
        UnitHealthStatus[UnitHealthTypes.SERVER_NA]
      );
    });
  });

  describe("#getTitle", () => {
    beforeEach(() => {
      thisUnit = new HealthUnit({
        id: "foo",
        name: "Foo Unit",
        health: "0",
      });
    });

    it("returns a string", () => {
      expect(typeof thisUnit.getTitle()).toEqual("string");
    });

    it("returns the name if available", () => {
      expect(thisUnit.getTitle()).toEqual("Foo Unit");
    });

    it("returns pretty print title if name not available", () => {
      thisUnit = new HealthUnit({
        id: "foo",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo");
    });
  });

  describe("#getPrettyPrintID", () => {
    it("removes dcos prefix from ID", () => {
      thisUnit = new HealthUnit({
        id: "dcos-foo",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo");
    });

    it("removes dashes", () => {
      thisUnit = new HealthUnit({
        id: "foo-bar",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dots", () => {
      thisUnit = new HealthUnit({
        id: "foo.bar",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar");
    });

    it("removes dashes and dots", () => {
      thisUnit = new HealthUnit({
        id: "foo-bar.qqq",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo Bar Qqq");
    });

    it("removes capitalizes DNS", () => {
      thisUnit = new HealthUnit({
        id: "foo-dns-bar",
        health: "0",
      });
      expect(thisUnit.getTitle()).toEqual("Foo DNS Bar");
    });
  });
});
