const HealthUnit = require("../HealthUnit");
const HealthUnitsList = require("../HealthUnitsList");

describe("HealthUnitsList", function() {
  describe("#constructor", function() {
    it("creates instances of HealthUnit", function() {
      var items = [{ foo: "bar" }];
      var list = new HealthUnitsList({ items });
      items = list.getItems();
      expect(items[0] instanceof HealthUnit).toBeTruthy();
    });
  });
});
