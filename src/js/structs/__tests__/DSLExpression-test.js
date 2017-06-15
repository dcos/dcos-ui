jest.dontMock("../DSLExpression");
jest.dontMock("../DSLASTNodes");
jest.dontMock("../../../resources/grammar/SearchDSL.jison");

const DSLExpression = require("../DSLExpression");
const DSLASTNodes = require("../DSLASTNodes");

describe("DSLExpression", function() {
  describe("#value", function() {
    it("returns the raw string value", function() {
      const expression = new DSLExpression("foo");

      expect(expression.value).toEqual("foo");
    });
  });

  describe("#defined", function() {
    it("returns true if there is a value defined", function() {
      const expression = new DSLExpression("foo");

      expect(expression.defined).toBeTruthy();
    });

    it("returns false if nothing defined", function() {
      const expression = new DSLExpression("");

      expect(expression.defined).toBeFalsy();
    });
  });

  describe("#filter", function() {
    it("returns a filter function", function() {
      const expression = new DSLExpression("foo");

      expect(typeof expression.filter).toEqual("function");
    });
  });

  describe("#ast", function() {
    it("returns the ast tree", function() {
      const expression = new DSLExpression("foo");

      expect(expression.ast instanceof DSLASTNodes.FilterNode).toBeTruthy();
    });
  });
});
