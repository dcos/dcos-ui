jest.dontMock("../DSLFormUtil");
jest.dontMock("../../structs/DSLExpressionPart");
jest.dontMock("../../structs/DSLASTNodes");

const DSLFilterTypes = require("../../constants/DSLFilterTypes");
const DSLFormUtil = require("../DSLFormUtil");
const DSLExpressionPart = require("../../structs/DSLExpressionPart");
const FilterNode = require("../../structs/DSLASTNodes").FilterNode;

describe("DSLFormUtil", function() {
  describe("#createNodeComparisionFunction", function() {
    it("should return `true` for FUZZY nodes, for any text", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        fuzzy: DSLExpressionPart.fuzzy
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeTruthy();
    });

    it("should return `false` for FUZZY nodes, if missing", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        fuzzy: DSLExpressionPart.fuzzy
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeFalsy();
    });

    it("should return `true` for EXACT nodes, for any text", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        exact: DSLExpressionPart.exact
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeTruthy();
    });

    it("should return `true` for EXACT nodes, if missing", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        exact: DSLExpressionPart.exact
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeFalsy();
    });

    it("should return `true` for ATTRIB nodes that match fully", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        attrib: DSLExpressionPart.attribute("is", "value")
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "is",
        text: "value"
      });

      expect(fn(unusedNode, astNode)).toBeTruthy();
    });

    it("should return `false` for ATTRIB nodes that match partially", function() {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        attrib: DSLExpressionPart.attribute("is", "value")
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "is",
        text: "valuez"
      });

      expect(fn(unusedNode, astNode)).toBeFalsy();
    });
  });
});
