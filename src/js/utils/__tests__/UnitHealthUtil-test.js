const HealthUnit = require("../../structs/HealthUnit");
const UnitHealthStatus = require("../../constants/UnitHealthStatus");
const UnitHealthTypes = require("../../constants/UnitHealthTypes");
const UnitHealthUtil = require("../../utils/UnitHealthUtil");
const NodesList = require("../../structs/NodesList");

let thisHealthWeight;

describe("UnitHealthUnit", () => {
  describe("#getHealthSorting", () => {
    beforeEach(() => {
      const unit = new HealthUnit({ health: 0, id: "aaa" });
      thisHealthWeight = UnitHealthUtil.getHealthSorting(unit);
    });

    it("returns a number", () => {
      expect(typeof thisHealthWeight).toEqual("number");
    });
  });

  describe("#getHealth", () => {
    it("returns a UnitHealthStatus object", () => {
      var health = 1;

      expect(UnitHealthUtil.getHealth(health)).toEqual({
        key: "UNHEALTHY",
        title: "Unhealthy",
        sortingValue: 0,
        value: 1,
        classNames: "text-danger"
      });
    });

    it("returns NA when health not valid", () => {
      var health = "wtf";
      expect(UnitHealthUtil.getHealth(health)).toEqual(
        UnitHealthStatus[UnitHealthTypes.SERVER_NA]
      );
    });
  });

  describe("#filterByHealth", () => {
    it("filters by unit health title", () => {
      const items = [
        { id: "food", health: 0 },
        { id: "bard", health: 0 },
        { id: "bluh", health: 2 }
      ];
      const list = new NodesList({ items });
      const filteredList = list.filter({ health: "healthy" }).getItems();
      expect(filteredList.length).toEqual(2);
      expect(filteredList[0].get("id")).toEqual("food");
      expect(filteredList[1].get("id")).toEqual("bard");
    });
  });
});
