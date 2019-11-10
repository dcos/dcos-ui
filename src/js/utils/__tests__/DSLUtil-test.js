import DSLFilterTypes from "../../constants/DSLFilterTypes";

const DSLASTNodes = require("../../structs/DSLASTNodes");
const DSLExpression = require("../../structs/DSLExpression");
const DSLExpressionPart = require("../../structs/DSLExpressionPart");
const DSLUtil = require("../DSLUtil");

let thisParts, thisAst, thisAttribs, thisFuzzy, thisExact;

describe("DSLUtil", () => {
  describe("#reduceAstFilters", () => {
    it("is called for every filter in the tree", () => {
      const ast = new DSLExpression('foo bar (is:attribute "exact")').ast;
      const handler = jest.fn();

      DSLUtil.reduceAstFilters(ast, handler);

      const texts = handler.mock.calls.map(call => {
        return call[1].filterParams.text;
      });

      expect(texts).toEqual(["foo", "bar", "attribute", "exact"]);
    });

    it("returns and process memo", () => {
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

  describe("#canFormProcessExpression", () => {
    it("returns true if no repeating token and no groups", () => {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr"');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns true if repeating token and no group", () => {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr" is:foo');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns true if group and no repeating token", () => {
      const expr = new DSLExpression('is:foo is:bar (foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns false if group and repeating token", () => {
      const expr = new DSLExpression('is:foo is:bar (is:foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeFalsy();
    });
  });

  describe("#canProcessParts", () => {
    beforeEach(() => {
      thisParts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("returns true when expression is empty", () => {
      const expression = new DSLExpression();

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns true when expression has a single attribute node", () => {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns false when expression has a repeating attribute node", () => {
      const expression = new DSLExpression("is:foo is:foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeFalsy();
    });

    it("returns true when expression has a single exact node", () => {
      const expression = new DSLExpression('"exact foo"');

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns false when expression has a repeating exact node", () => {
      const expression = new DSLExpression('"exact foo" "something else"');

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeFalsy();
    });

    it("returns true when expression has a single fuzzy node", () => {
      const expression = new DSLExpression("foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns true when expression has a repeating fuzzy nodes", () => {
      const expression = new DSLExpression("foo foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });
  });

  describe("#findNodesByFilter", () => {
    beforeEach(() => {
      thisAst = new DSLExpression('is:foo bar is:bar is:foo spacebar "foo-bar"')
        .ast;

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

      thisAttribs = [
        thisAst.children[0].children[0].children[0].children[0].children[0],
        thisAst.children[0].children[0].children[0].children[1],
        thisAst.children[0].children[0].children[1]
      ];

      thisFuzzy = [
        thisAst.children[0].children[0].children[0].children[0].children[1],
        thisAst.children[0].children[1]
      ];

      thisExact = [thisAst.children[1]];
    });

    it("returns all occurrences of attribute match", () => {
      const filter = DSLExpressionPart.attribute("is", "foo");

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual([
        thisAttribs[0],
        thisAttribs[2]
      ]);
    });

    it("returns all occurrences of fuzzy match", () => {
      const filter = DSLExpressionPart.fuzzy;

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual(thisFuzzy);
    });

    it("returns all occurrences of exact match", () => {
      const filter = DSLExpressionPart.exact;

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual(thisExact);
    });
  });

  describe("#getPartValues", () => {
    beforeEach(() => {
      thisParts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("sets `true` on existing attributes", () => {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: true,
        exact: null,
        fuzzy: null
      });
    });

    it("sets the string value of exact matches", () => {
      const expression = new DSLExpression('"this is a test"');

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: false,
        exact: "this is a test",
        fuzzy: null
      });
    });

    it("sets the string value of fuzzy matches", () => {
      const expression = new DSLExpression("foo bar token");

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: false,
        exact: null,
        fuzzy: "foo bar token"
      });
    });

    it("handles more than one property in expression", () => {
      const expression = new DSLExpression('foo "exact" is:foo bar token');

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: true,
        exact: "exact",
        fuzzy: "foo bar token"
      });
    });
  });

  describe("#getNodeString", () => {
    it("returns the string of attribute nodes", () => {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("label:text");
    });

    it("returns the string of fuzzy nodes", () => {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("text");
    });

    it("returns the string of exact nodes", () => {
      const node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual('"text"');
    });
  });
});
