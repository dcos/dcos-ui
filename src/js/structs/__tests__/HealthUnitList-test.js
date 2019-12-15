import HealthUnit from "../HealthUnit";
import HealthUnitsList from "../HealthUnitsList";

describe("HealthUnitsList", () => {
  describe("#constructor", () => {
    it("creates instances of HealthUnit", () => {
      let items = [{ foo: "bar" }];
      const list = new HealthUnitsList({ items });
      items = list.getItems();
      expect(items[0] instanceof HealthUnit).toBeTruthy();
    });
  });
});
