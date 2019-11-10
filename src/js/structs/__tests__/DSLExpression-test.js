const DSLExpression = require("../DSLExpression");
const DSLASTNodes = require("../DSLASTNodes");

describe("DSLExpression", () => {
  describe("#value", () => {
    it("returns the raw string value", () => {
      const expression = new DSLExpression("foo");

      expect(expression.value).toEqual("foo");
    });
  });

  describe("#defined", () => {
    it("returns true if there is a value defined", () => {
      const expression = new DSLExpression("foo");

      expect(expression.defined).toBeTruthy();
    });

    it("returns false if nothing defined", () => {
      const expression = new DSLExpression("");

      expect(expression.defined).toBeFalsy();
    });
  });

  describe("#filter", () => {
    it("returns a filter function", () => {
      const expression = new DSLExpression("foo");

      expect(typeof expression.filter).toEqual("function");
    });
  });

  describe("#ast", () => {
    it("returns the ast tree", () => {
      const expression = new DSLExpression("foo");

      expect(expression.ast instanceof DSLASTNodes.FilterNode).toBeTruthy();
    });
  });
});
