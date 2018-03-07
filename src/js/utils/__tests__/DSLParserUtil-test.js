const DSLASTNodes = require("../../structs/DSLASTNodes");
const DSLCombinerTypes = require("../../constants/DSLCombinerTypes");
const DSLFilter = require("../../structs/DSLFilter");
const DSLFilterList = require("../../structs/DSLFilterList");
const DSLFilterTypes = require("../../constants/DSLFilterTypes");
const DSLParserUtil = require("../DSLParserUtil");
const List = require("../../structs/List");

class AttribFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.ATTRIB;
  }
  filterApply(resultset) {
    return resultset.filterItems(item => {
      return item.text.indexOf("attribute") !== -1;
    });
  }
}

class ExactFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.EXACT;
  }
  filterApply(resultset) {
    return resultset.filterItems(item => {
      return item.text.indexOf("exact") !== -1;
    });
  }
}

class FuzzyFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.FUZZY;
  }
  filterApply(resultset) {
    return resultset.filterItems(item => {
      return item.text.indexOf("fuzzy") !== -1;
    });
  }
}

let thisMockData, thisOp, thisOpLeft, thisOpRight;

describe("DSLParserUtil", function() {
  beforeEach(function() {
    thisMockData = new List({
      items: [
        { text: "attribute" },
        { text: "fuzzy" },
        { text: "exact" },
        { text: "attribute fuzzy" }
      ]
    });
  });

  describe("#Operator.attribute", function() {
    beforeEach(function() {
      thisOp = DSLParserUtil.Operator.attribute("label", "text", 0, 5, 10, 20);
    });

    it("creates the correct ast node", function() {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([[0, 5], [10, 20]]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.ATTRIB);
      expect(ast.filterParams).toEqual({
        label: "label",
        text: "text"
      });
    });

    it("creates the correct filter function", function() {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = new DSLFilterList([new AttribFilter()]);

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute" },
        { text: "attribute fuzzy" }
      ]);
    });
  });

  describe("#Operator.exact", function() {
    beforeEach(function() {
      thisOp = DSLParserUtil.Operator.exact("text", 0, 10);
    });

    it("creates the correct ast node", function() {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([[0, 10]]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.EXACT);
      expect(ast.filterParams).toEqual({
        text: "text"
      });
    });

    it("creates the correct filter function", function() {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = new DSLFilterList([new ExactFilter()]);

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "exact" }
      ]);
    });
  });

  describe("#Operator.fuzzy", function() {
    beforeEach(function() {
      thisOp = DSLParserUtil.Operator.fuzzy("text", 0, 10);
    });

    it("creates the correct ast node", function() {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.FilterNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([]);
      expect(ast.position).toEqual([[0, 10]]);

      // FilterNode properties
      expect(ast.filterType).toEqual(DSLFilterTypes.FUZZY);
      expect(ast.filterParams).toEqual({
        text: "text"
      });
    });

    it("creates the correct filter function", function() {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = new DSLFilterList([new FuzzyFilter()]);

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "fuzzy" },
        { text: "attribute fuzzy" }
      ]);
    });
  });

  describe("#Merge.and", function() {
    beforeEach(function() {
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

    it("creates the correct ast node", function() {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.CombinerNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([thisOpLeft.ast, thisOpRight.ast]);
      expect(ast.position).toEqual([[0, 30]]);

      // CombinerNode properties
      expect(ast.combinerType).toEqual(DSLCombinerTypes.AND);
    });

    it("creates the correct filter function", function() {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = new DSLFilterList([
        new AttribFilter(),
        new FuzzyFilter()
      ]);

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute fuzzy" }
      ]);
    });
  });

  describe("#Merge.or", function() {
    beforeEach(function() {
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

    it("creates the correct ast node", function() {
      const { ast } = thisOp;
      expect(ast instanceof DSLASTNodes.CombinerNode).toBeTruthy();

      // ASTNode properties
      expect(ast.children).toEqual([thisOpLeft.ast, thisOpRight.ast]);
      expect(ast.position).toEqual([[0, 30]]);

      // CombinerNode properties
      expect(ast.combinerType).toEqual(DSLCombinerTypes.OR);
    });

    it("creates the correct filter function", function() {
      const { filter } = thisOp;

      expect(typeof filter).toEqual("function");

      const filters = new DSLFilterList([
        new AttribFilter(),
        new FuzzyFilter()
      ]);

      expect(filter(filters, thisMockData).getItems()).toEqual([
        { text: "attribute" },
        { text: "attribute fuzzy" },
        { text: "fuzzy" }
      ]);
    });
  });
});
