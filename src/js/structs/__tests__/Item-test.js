import Item from "../Item";

describe("Item", () => {
  describe("#constructor", () => {
    it("sets object properties as instance properties", () => {
      const item = new Item({ a: 1, b: 2 });
      expect(item.a).toEqual(1);
      expect(item.b).toEqual(2);
    });
  });

  describe("#get", () => {
    it("returns undefined for non existent properties", () => {
      const item = new Item();
      expect(item.get("foo")).toEqual(undefined);
    });

    it("returns property when it exists", () => {
      const item = new Item({ foo: "bar" });
      expect(item.get("foo")).toEqual("bar");
    });

    it("returns all properties when no key is defined", () => {
      const item = new Item({ foo: "bar", baz: "qux" });
      expect(item.get()).toEqual({ foo: "bar", baz: "qux" });
    });
  });
});
