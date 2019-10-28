import * as DSLUtil from "../DSLUtil";
import { FilterNode } from "../DSLASTNodes";
import DSLFilterTypes from "../DSLFilterTypes";
import DSLExpression from "../DSLExpression";
import DSLExpressionPart from "../DSLExpressionPart";

let thisParts, thisAst, thisAttribs, thisFuzzy, thisExact;

describe("DSLUtil", function() {
  describe("#reduceAstFilters", function() {
    it("is called for every filter in the tree", function() {
      const ast = new DSLExpression('foo bar (is:attribute "exact")').ast;
      const handler = jest.fn();

      DSLUtil.reduceAstFilters(ast, handler);

      const texts = handler.mock.calls.map(call => {
        return call[1].filterParams.text;
      });

      expect(texts).toEqual(["foo", "bar", "attribute", "exact"]);
    });

    it("returns and process memo", function() {
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
    it("returns true if no repeating token and no groups", function() {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr"');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns true if repeating token and no group", function() {
      const expr = new DSLExpression('is:foo is:bar foo bar "expr" is:foo');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns true if group and no repeating token", function() {
      const expr = new DSLExpression('is:foo is:bar (foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it("returns false if group and repeating token", function() {
      const expr = new DSLExpression('is:foo is:bar (is:foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeFalsy();
    });
  });

  describe("#canProcessParts", function() {
    beforeEach(function() {
      thisParts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("returns true when expression is empty", function() {
      const expression = new DSLExpression();

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns true when expression has a single attribute node", function() {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns false when expression has a repeating attribute node", function() {
      const expression = new DSLExpression("is:foo is:foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeFalsy();
    });

    it("returns true when expression has a single exact node", function() {
      const expression = new DSLExpression('"exact foo"');

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns false when expression has a repeating exact node", function() {
      const expression = new DSLExpression('"exact foo" "something else"');

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeFalsy();
    });

    it("returns true when expression has a single fuzzy node", function() {
      const expression = new DSLExpression("foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });

    it("returns true when expression has a repeating fuzzy nodes", function() {
      const expression = new DSLExpression("foo foo");

      expect(DSLUtil.canProcessParts(expression, thisParts)).toBeTruthy();
    });
  });

  describe("#findNodesByFilter", function() {
    beforeEach(function() {
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

    it("returns all occurrences of attribute match", function() {
      const filter = DSLExpressionPart.attribute("is", "foo");

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual([
        thisAttribs[0],
        thisAttribs[2]
      ]);
    });

    it("returns all occurrences of fuzzy match", function() {
      const filter = DSLExpressionPart.fuzzy;

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual(thisFuzzy);
    });

    it("returns all occurrences of exact match", function() {
      const filter = DSLExpressionPart.exact;

      expect(DSLUtil.findNodesByFilter(thisAst, filter)).toEqual(thisExact);
    });
  });

  describe("#getPartValues", function() {
    beforeEach(function() {
      thisParts = {
        attr: DSLExpressionPart.attribute("is", "foo"),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it("sets `true` on existing attributes", function() {
      const expression = new DSLExpression("is:foo");

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: true,
        exact: null,
        fuzzy: null
      });
    });

    it("sets the string value of exact matches", function() {
      const expression = new DSLExpression('"this is a test"');

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: false,
        exact: "this is a test",
        fuzzy: null
      });
    });

    it("sets the string value of fuzzy matches", function() {
      const expression = new DSLExpression("foo bar token");

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: false,
        exact: null,
        fuzzy: "foo bar token"
      });
    });

    it("handles more than one property in expression", function() {
      const expression = new DSLExpression('foo "exact" is:foo bar token');

      expect(DSLUtil.getPartValues(expression, thisParts)).toEqual({
        attr: true,
        exact: "exact",
        fuzzy: "foo bar token"
      });
    });
  });

  describe("#getNodeString", function() {
    it("returns the string of attribute nodes", function() {
      const node = new FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: "label",
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("label:text");
    });

    it("returns the string of fuzzy nodes", function() {
      const node = new FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual("text");
    });

    it("returns the string of exact nodes", function() {
      const node = new FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: "text"
      });

      expect(DSLUtil.getNodeString(node)).toEqual('"text"');
    });
  });
});
