import LocalStorageUtil from "../../utils/LocalStorageUtil";

describe("LocalStorageUtil", () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  describe("#get", () => {
    it("gets value from localStorage", () => {
      global.localStorage.setItem("foo", "bar");
      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });

    it("does not mutate", () => {
      global.localStorage.setItem("foo", "bar");
      LocalStorageUtil.get("foo");

      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });
  });

  describe("#set", () => {
    it("gets value from localStorage", () => {
      LocalStorageUtil.set("foo", "bar");
      expect(LocalStorageUtil.get("foo")).toEqual("bar");
    });
  });
});
