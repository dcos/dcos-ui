import GetSetBaseStore from "../GetSetBaseStore";

let thisInstance;

describe("GetSetBaseStore", () => {
  beforeEach(() => {
    thisInstance = new GetSetBaseStore();
  });

  describe("#get", () => {
    it("returns undefined if no key is given", () => {
      expect(thisInstance.get()).toEqual(null);
    });

    it("returns undefined if given an object", () => {
      expect(thisInstance.get({})).toEqual(null);
    });

    it("returns null if property hasn't been defined", () => {
      expect(thisInstance.get("foo")).toEqual(null);
    });

    it("returns the correct value given a key", () => {
      var instance = thisInstance;
      instance.set({ someProperty: "someValue" });
      expect(thisInstance.get("someProperty")).toEqual("someValue");
    });

    it("allows for default state values", () => {
      var instance = new GetSetBaseStore();
      instance.getSet_data = {
        foo: "bar"
      };

      expect(instance.get("foo")).toEqual("bar");
    });
  });

  describe("#set", () => {
    it("throws an error when called with a non-object", () => {
      var fn = thisInstance.set.bind(thisInstance, "string");
      expect(fn).toThrow();
    });

    it("throws an error when called with an array-like object", () => {
      var fn = thisInstance.set.bind(thisInstance, []);
      expect(fn).toThrow();
    });

    it("overrides previously set values", () => {
      thisInstance.set({ foo: 1, bar: 2, baz: 3 });
      thisInstance.set({ foo: "foo", bar: "bar" });

      expect(thisInstance.get("foo")).toEqual("foo");
      expect(thisInstance.get("bar")).toEqual("bar");
      expect(thisInstance.get("baz")).toEqual(3);
    });
  });
});
