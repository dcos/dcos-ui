const HealthUnit = require("../HealthUnit");
const HealthUnitsList = require("../HealthUnitsList");

describe("HealthUnitsList", () => {
  describe("#constructor", () => {
    it("creates instances of HealthUnit", () => {
      var items = [{ foo: "bar" }];
      var list = new HealthUnitsList({ items });
      items = list.getItems();
      expect(items[0] instanceof HealthUnit).toBeTruthy();
    });
  });
});
