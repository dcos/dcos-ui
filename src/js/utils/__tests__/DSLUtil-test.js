jest.dontMock("../DSLParserUtil");
jest.dontMock("../DSLUtil");
jest.dontMock("../../structs/DSLExpression");
jest.dontMock("../../structs/DSLExpressionPart");
jest.dontMock("../../../resources/grammar/SearchDSL.jison");

const DSLASTNodes = require("../../structs/DSLASTNodes");
const DSLExpression = require("../../structs/DSLExpression");
const DSLExpressionPart = require("../../structs/DSLExpressionPart");
const DSLFilterTypes = require("../../constants/DSLFilterTypes");
const DSLUtil = require("../DSLUtil");

describe("DSLUtil", function() {
  describe("#reduceAstFilters", function() {
    it("should be called for every filter in the tree", function() {
      const ast = new DSLExpression('foo bar (is:attribute "exact")').ast;
      const handler = jest.fn();

      DSLUtil.reduceAstFilters(ast, handler);

      const texts = handler.mock.calls.map(call => {
        return call[1].filterParams.text;
      });

      expect(texts).toEqual(["foo", "bar", "attribute", "exact"]);
    });

    it("should correctly return and process memo", function() {
      const ast = new DSLExpression('foo bar (is:attribute "exact")').ast;
      const texts = DSLUtil.reduceAstFilters(
        ast,
        (memo, filter) => {
          return memo.concat(filter.filterParams.text);
        },
        []
      );

      expect(texts).toEqual(["foo", "bar", "attribute", "exact"]);
    });
  });

  describe("#canFormProcessExpression", function() {
    it("should return true if no repeating token and no groups", function() {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr"');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("should return true if repeating token and no group", function() {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr" is:foo');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("should return true if group and no repeating token", function() {
      const expr = new DSLExpression('is:foo is:bar (foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("should return false if group and repeating token", function() {
      const expr = new DSLExpression('is:foo is:bar (is:foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeFalsy();
    });
  });

  describe("#canProcessParts", function() {
    beforeEach(function() {
      this.parts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("should return true when expression is empty", function() {
      const expression = new DSLExpression();

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeTruthy();
    });

    it("should return true when expression has a single attribute node", function() {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeTruthy();
    });

    it("should return false when expression has a repeating attribute node", function() {
      const expression = new DSLExpression("is:foo is:foo");

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeFalsy();
    });

    it("should return true when expression has a single exact node", function() {
      const expression = new DSLExpression('"exact foo"');

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeTruthy();
    });

    it("should return false when expression has a repeating exact node", function() {
      const expression = new DSLExpression('"exact foo" "something else"');

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeFalsy();
    });

    it("should return true when expression has a single fuzzy node", function() {
      const expression = new DSLExpression("foo");

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeTruthy();
    });

    it("should return true when expression has a repeating fuzzy nodes", function() {
      const expression = new DSLExpression("foo foo");

      expect(DSLUtil.canProcessParts(expression, this.parts)).toBeTruthy();
    });
  });

  describe("#findNodesByFilter", function() {
    beforeEach(function() {
      this.ast = new DSLExpression(
        'is:foo bar is:bar is:foo spacebar "foo-bar"'
      ).ast;

      // For reference, the parsed AST is visualized like so:
      //
      // AND: [
      //   AND: [
      //     AND: [
      //       AND: [
      //         AND: [
      //           'is:foo',
      //           'bar'
      //         ],
      //         'is:bar'
      //       ],
      //       'is:foo'
      //     ],
      //     'spacebar'
      //   ],
      //   '"foo-bar"'
      // ]

      // console.log(this.ast);

      this.attribs = [
        this.ast.children[0].children[0].children[0].children[0].children[0],
        this.ast.children[0].children[0].children[0].children[1],
        this.ast.children[0].children[0].children[1]
      ];

      this.fuzzy = [
        this.ast.children[0].children[0].children[0].children[0].children[1],
        this.ast.children[0].children[1]
      ];

      this.exact = [this.ast.children[1]];
    });

    it("should return all occurrences of attribute match", function() {
      const filter = DSLExpressionPart.attribute("is", "foo");

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual([
        this.attribs[0],
        this.attribs[2]
      ]);
    });

    it("should return all occurrences of fuzzy match", function() {
      const filter = DSLExpressionPart.fuzzy;

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual(this.fuzzy);
    });

    it("should return all occurrences of exact match", function() {
      const filter = DSLExpressionPart.exact;

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual(this.exact);
    });
  });

  describe("#getPartValues", function() {
    beforeEach(function() {
      this.parts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("should set `true` on existing attributes", function() {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.getPartValues(expression, this.parts)).toEqual({
        attr: true,
        exact: null,
        fuzzy: null
      });
    });

    it("should set the string value of exact matches", function() {
      const expression = new DSLExpression('"this is a test"');

      expect(DSLUtil.getPartValues(expression, this.parts)).toEqual({
        attr: false,
        exact: "this is a test",
        fuzzy: null
      });
    });

    it("should set the string value of fuzzy matches", function() {
      const expression = new DSLExpression("foo bar token");

      expect(DSLUtil.getPartValues(expression, this.parts)).toEqual({
        attr: false,
        exact: null,
        fuzzy: "foo bar token"
      });
    });

    it("should properly handle more than one property in expression", function() {
      const expression = new DSLExpression('foo "exact" is:foo bar token');

      expect(DSLUtil.getPartValues(expression, this.parts)).toEqual({
        attr: true,
        exact: "exact",
        fuzzy: "foo bar token"
      });
    });
  });

  describe("#getNodeString", function() {
    it("should correctly return the string of attribute nodes", function() {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("label:text");
    });

    it("should correctly return the string of fuzzy nodes", function() {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("text");
    });

    it("should correctly return the string of exact nodes", function() {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual('"text"');
    });
  });
});
