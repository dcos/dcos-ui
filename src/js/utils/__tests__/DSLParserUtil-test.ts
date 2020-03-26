import DSLFilter from "../../structs/DSLFilter";
import DSLFilterTypes from "../../constants/DSLFilterTypes";
import DSLCombinerTypes from "../../constants/DSLCombinerTypes";
import DSLParserUtil from "../DSLParserUtil";
import List from "../../structs/List";

import DSLASTNodes from "../../structs/DSLASTNodes";

class AttribFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.ATTRIB;
  }
  filterApply(resultset) {
    return resultset.filterItems(
      (item) => item.text.indexOf("attribute") !== -1
    );
  }
}

class ExactFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.EXACT;
  }
  filterApply(resultset) {
    return resultset.filterItems((item) => item.text.indexOf("exact") !== -1);
  }
}

class FuzzyFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.FUZZY;
  }
  filterApply(resultset) {
    return resultset.filterItems((item) => item.text.indexOf("fuzzy") !== -1);
  }
}

let thisMockData, thisOp, thisOpLeft, thisOpRight;

describe("DSLParserUtil", () => {
  beforeEach(() => {
    thisMockData = new List({
      items: [
        { text: "attribute" },
        { text: "fuzzy" },
        { text: "exact" },
        { text: "attribute fuzzy" },
      ],
    });
  });

  describe("#Operator.attribute", () => {
    beforeEach(() => {
      thisOp = DSLParserUtil.Operator.attribute("label", "text", 0, 5, 10, 20);
    });

    it("creates the correct ast node", () => {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([
        [0, 5],
        [10, 20],
      ]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.ATTRIB);
      expect(ast.filterParams).toEqual({
        label: "label",
        text: "text",
      });
    });

    it("creates the correct filter function", () => {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = [new AttribFilter()];

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute" },
        { text: "attribute fuzzy" },
      ]);
    });
  });

  describe("#Operator.exact", () => {
    beforeEach(() => {
      thisOp = DSLParserUtil.Operator.exact("text", 0, 10);
    });

    it("creates the correct ast node", () => {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([[0, 10]]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.EXACT);
      expect(ast.filterParams).toEqual({
        text: "text",
      });
    });

    it("creates the correct filter function", () => {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = [new ExactFilter()];

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "exact" },
      ]);
    });
  });

  describe("#Operator.fuzzy", () => {
    beforeEach(() => {
      thisOp = DSLParserUtil.Operator.fuzzy("text", 0, 10);
    });

    it("creates the correct ast node", () => {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([[0, 10]]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.FUZZY);
      expect(ast.filterParams).toEqual({
        text: "text",
      });
    });

    it("creates the correct filter function", () => {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = [new FuzzyFilter()];

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "fuzzy" },
        { text: "attribute fuzzy" },
      ]);
    });
  });

  describe("#Merge.and", () => {
    beforeEach(() => {
      thisOpLeft = DSLParserUtil.Operator.attribute(
        "label",
        "text",
        0,
        5,
        10,
        20
      );
      thisOpRight = DSLParserUtil.Operator.fuzzy("text", 21, 30);
      thisOp = DSLParserUtil.Merge.and(thisOpLeft, thisOpRight);
    });

    it("creates the correct ast node", () => {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.CombinerNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([thisOpLeft.ast, thisOpRight.ast]);
      expect(ast.position).toEqual([[0, 30]]);

      // CombinerNode properties
      expect(ast.combinerType).toEqual(DSLCombinerTypes.AND);
    });

    it("creates the correct filter function", () => {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = [new AttribFilter(), new FuzzyFilter()];

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute fuzzy" },
      ]);
    });
  });

  describe("#Merge.or", () => {
    beforeEach(() => {
      thisOpLeft = DSLParserUtil.Operator.attribute(
        "label",
        "text",
        0,
        5,
        10,
        20
      );
      thisOpRight = DSLParserUtil.Operator.fuzzy("text", 21, 30);
      thisOp = DSLParserUtil.Merge.or(thisOpLeft, thisOpRight);
    });

    it("creates the correct ast node", () => {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.CombinerNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([thisOpLeft.ast, thisOpRight.ast]);
      expect(ast.position).toEqual([[0, 30]]);

      // CombinerNode properties
      expect(ast.combinerType).toEqual(DSLCombinerTypes.OR);
    });

    it("creates the correct filter function", () => {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = [new AttribFilter(), new FuzzyFilter()];

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute" },
        { text: "attribute fuzzy" },
        { text: "fuzzy" },
      ]);
    });
  });
});
