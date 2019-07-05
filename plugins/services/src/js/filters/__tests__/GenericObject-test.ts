import { filterByObject } from "../GenericObject";

describe("GenericObject", () => {
  describe("#filterByObject", () => {
    it("can filter by string", () => {
      expect(filterByObject({ foo: "bar" }, { foo: "baz" })).toEqual(false);
      expect(filterByObject({ foo: "bar" }, { foo: "bar" })).toEqual(true);
    });
    it("can filter by number", () => {
      expect(filterByObject({ foo: 100 }, { foo: 0 })).toEqual(false);
      expect(filterByObject({ foo: 100 }, { foo: 100 })).toEqual(true);
    });
    it("can filter by boolean", () => {
      expect(filterByObject({ foo: true }, { foo: false })).toEqual(false);
      expect(filterByObject({ foo: true }, { foo: true })).toEqual(true);
    });
    it("can filter for undefined", () => {
      expect(filterByObject({ foo: true }, { foo: undefined })).toEqual(false);
      expect(filterByObject({ foo: true }, { bar: undefined })).toEqual(false);
    });
    it("can filter deeply nested keys", () => {
      expect(
        filterByObject(
          { foo: { bar: { baz: true } } },
          { foo: { bar: { baz: true } } }
        )
      ).toEqual(true);
      expect(
        filterByObject(
          { foo: { bar: { baz: false } } },
          { foo: { bar: { baz: true } } }
        )
      ).toEqual(false);
    });
    it("can filter on multiple keys", () => {
      expect(
        filterByObject({ foo: true, bar: "baz" }, { foo: true, bar: "baz" })
      ).toEqual(true);
      expect(
        filterByObject({ foo: false, bar: "baz" }, { foo: true, bar: "baz" })
      ).toEqual(false);
      expect(
        filterByObject({ foo: true, bar: "test" }, { foo: true, bar: "baz" })
      ).toEqual(false);
      expect(
        filterByObject({ foo: false, bar: "test" }, { foo: true, bar: "baz" })
      ).toEqual(false);
    });
  });
});
