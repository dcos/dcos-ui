const testUtil = require("../testUtil");

describe("testUtil", () => {
  describe("#getSearchParameter", () => {
    it("gets first search parameter", () => {
      const uri = "something?q=something&q=somethingelse";
      expect(testUtil.getSearchParameter(uri)).to.equal("q=something");
    });

    it("returns undefined if no query is found", () => {
      const uri = "something?t=0m";
      expect(testUtil.getSearchParameter(uri)).to.equal(undefined);
    });
  });
});
