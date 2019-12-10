import DSLFilterTypes from "../../constants/DSLFilterTypes";
import DSLExpressionPart from "../../structs/DSLExpressionPart";

const DSLFormUtil = require("../DSLFormUtil");
const FilterNode = require("../../structs/DSLASTNodes").FilterNode;

describe("DSLFormUtil", () => {
  describe("#createNodeComparisionFunction", () => {
    it("returns `true` for FUZZY nodes, for any text", () => {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        fuzzy: DSLExpressionPart.fuzzy
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeTruthy();
    });

    it("returns `false` for FUZZY nodes, if missing", () => {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        fuzzy: DSLExpressionPart.fuzzy
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeFalsy();
    });

    it("returns `true` for EXACT nodes, for any text", () => {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        exact: DSLExpressionPart.exact
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeTruthy();
    });

    it("returns `true` for EXACT nodes, if missing", () => {
      const fn = DSLFormUtil.createNodeComparisionFunction({
        exact: DSLExpressionPart.exact
      });

      const unusedNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {});
      const astNode = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "bar"
      });

      expect(fn(unusedNode, astNode)).toBeFalsy();
    });

    it("returns `true` for ATTRIB nodes that match fully", () => {
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

    it("returns `false` for ATTRIB nodes that match partially", () => {
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
