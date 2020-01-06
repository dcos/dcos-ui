import Item from "../../structs/Item";
import List from "../../structs/List";
import StructUtil from "../StructUtil";

import isEqual from "deep-equal";

describe("StructUtil", () => {
  describe("#copyRawObject", () => {
    const expectedArrayItems = [
      1,
      "foo",
      null,
      { foo: "bar" },
      { item: "struct" }
    ];
    // Turn last item into a struct
    const arrayItems = expectedArrayItems.slice();
    arrayItems.push(new Item(arrayItems.pop()));
    // Create List struct with embedded Item struct
    const listStruct = new List({ items: arrayItems });
    // Create Item struct with embedded List Struct
    const itemStruct = new Item({ qux: "foo", items: listStruct });

    it("returns original data if no structs", () => {
      const fn = () => {};
      const originalObject = [1, "string", fn, true];
      const newObj = StructUtil.copyRawObject(originalObject);
      expect(isEqual(newObj, originalObject)).toBeTruthy();
    });

    it("returns original data from List struct", () => {
      const newObj = StructUtil.copyRawObject(listStruct);
      expect(isEqual(newObj, expectedArrayItems)).toBeTruthy();
    });

    it("clones Objects", () => {
      const array = [];
      const object = {};
      expect(StructUtil.copyRawObject(array) !== array).toBeTruthy();
      expect(StructUtil.copyRawObject(object) !== object).toBeTruthy();
    });

    it("clones Objects with structs", () => {
      const newObj = StructUtil.copyRawObject(itemStruct);
      expect(itemStruct._itemData !== newObj).toBeTruthy();
      expect(newObj.items !== expectedArrayItems).toBeTruthy();
    });

    it("returns original data with nested structs", () => {
      const fn = () => {};
      const nestedObj = {
        foo: listStruct,
        bar: itemStruct,
        foobar: fn
      };
      const newObj = StructUtil.copyRawObject(nestedObj);
      const expectedObj = {
        foo: expectedArrayItems,
        bar: {
          qux: "foo",
          items: expectedArrayItems
        },
        foobar: fn
      };
      expect(isEqual(newObj, expectedObj)).toBeTruthy();
    });
  });
});
