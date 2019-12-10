import Item from "../../structs/Item";
import List from "../../structs/List";
import StructUtil from "../StructUtil";

const isEqual = require("deep-equal");

describe("StructUtil", () => {
  describe("#copyRawObject", () => {
    var expectedArrayItems = [
      1,
      "foo",
      null,
      { foo: "bar" },
      { item: "struct" }
    ];
    // Turn last item into a struct
    var arrayItems = expectedArrayItems.slice();
    arrayItems.push(new Item(arrayItems.pop()));
    // Create List struct with embedded Item struct
    var listStruct = new List({ items: arrayItems });
    // Create Item struct with embedded List Struct
    var itemStruct = new Item({ qux: "foo", items: listStruct });

    it("returns original data if no structs", () => {
      var fn = () => {};
      var originalObject = [1, "string", fn, true];
      var newObj = StructUtil.copyRawObject(originalObject);
      expect(isEqual(newObj, originalObject)).toBeTruthy();
    });

    it("returns original data from List struct", () => {
      var newObj = StructUtil.copyRawObject(listStruct);
      expect(isEqual(newObj, expectedArrayItems)).toBeTruthy();
    });

    it("clones Objects", () => {
      var array = [];
      var object = {};
      expect(StructUtil.copyRawObject(array) !== array).toBeTruthy();
      expect(StructUtil.copyRawObject(object) !== object).toBeTruthy();
    });

    it("clones Objects with structs", () => {
      var newObj = StructUtil.copyRawObject(itemStruct);
      expect(itemStruct._itemData !== newObj).toBeTruthy();
      expect(newObj.items !== expectedArrayItems).toBeTruthy();
    });

    it("returns original data with nested structs", () => {
      var fn = () => {};
      var nestedObj = {
        foo: listStruct,
        bar: itemStruct,
        foobar: fn
      };
      var newObj = StructUtil.copyRawObject(nestedObj);
      var expectedObj = {
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
