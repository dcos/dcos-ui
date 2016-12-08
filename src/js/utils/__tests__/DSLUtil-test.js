jest.dontMock('../DSLParserUtil');
jest.dontMock('../DSLUtil');
jest.dontMock('../../structs/DSLExpression');
jest.dontMock('../../structs/DSLExpressionPart');
jest.dontMock('../../../resources/grammar/SearchDSL.jison');

const DSLExpression = require('../../structs/DSLExpression');
const DSLASTNodes = require('../../structs/DSLASTNodes');
const DSLFilterTypes = require('../../constants/DSLFilterTypes');
const DSLExpressionPart = require('../../structs/DSLExpressionPart');
const DSLUtil = require('../DSLUtil');
const SearchDSL = require('../../../resources/grammar/SearchDSL.jison');

describe('DSLUtil', function () {

  describe('#reduceAstFilters', function () {

    it('should be called for every filter in the tree', function () {
      let ast = SearchDSL.parse('foo bar (is:attrib "exact")').ast;
      let handler = jest.fn();

      DSLUtil.reduceAstFilters(ast, handler);

      let texts = handler.mock.calls.map((call) => {
        return call[1].filterParams.text;
      });

      expect(texts).toEqual([
        'foo',
        'bar',
        'attrib',
        'exact'
      ]);
    });

    it('should correctly return and process memo', function () {
      let ast = SearchDSL.parse('foo bar (is:attrib "exact")').ast;
      let texts = DSLUtil.reduceAstFilters(ast, (memo, filter) => {
        return memo.concat(filter.filterParams.text);
      }, []);

      expect(texts).toEqual([
        'foo',
        'bar',
        'attrib',
        'exact'
      ]);
    });

  });

  describe('#canFormProcessExpression', function () {

    it('should return true if no repeating token and no groups', function () {
      let expr = new DSLExpression('is:foo is:bar foo bar "expr"');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it('should return true if repeating token and no group', function () {
      let expr = new DSLExpression('is:foo is:bar foo bar "expr" is:foo');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it('should return true if group and no repeating token', function () {
      let expr = new DSLExpression('is:foo is:bar (foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeTruthy();
    });

    it('should return false if group and repeating token', function () {
      let expr = new DSLExpression('is:foo is:bar (is:foo bar "expr")');

      expect(DSLUtil.canFormProcessExpression(expr)).toBeFalsy();
    });

  });

  describe('#canProcessPropTypes', function () {

    beforeEach(function () {
      this.propTypes = {
        attr: DSLExpressionPart.attrib('is', 'foo'),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it('should return true when ast is empty', function () {
      const ast = null;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeTruthy();
    });

    it('should return true when ast has a single attrib node', function () {
      const ast = SearchDSL.parse('is:foo').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeTruthy();
    });

    it('should return false when ast has a repeating attrib node', function () {
      const ast = SearchDSL.parse('is:foo is:foo').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeFalsy();
    });

    it('should return true when ast has a single exact node', function () {
      const ast = SearchDSL.parse('"exact foo"').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeTruthy();
    });

    it('should return false when ast has a repeating exact node', function () {
      const ast = SearchDSL.parse('"exact foo" "something else"').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeFalsy();
    });

    it('should return true when ast has a single fuzzy node', function () {
      const ast = SearchDSL.parse('foo').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeTruthy();
    });

    it('should return true when ast has a repeating fuzzy nodes', function () {
      const ast = SearchDSL.parse('foo foo').ast;

      expect(DSLUtil.canProcessPropTypes(ast, this.propTypes)).toBeTruthy();
    });

  });

  describe('#findNodesByFilter', function () {

    beforeEach(function () {
      this.ast = SearchDSL.parse(
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

      this.exact = [
        this.ast.children[1]
      ];
    });

    it('should return all occurrences of attrib match', function () {
      let filter = DSLExpressionPart.attrib('is', 'foo');

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual([
        this.attribs[0], this.attribs[2]
      ]);
    });

    it('should return all occurrences of fuzzy match', function () {
      let filter = DSLExpressionPart.fuzzy;

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual(this.fuzzy);
    });

    it('should return all occurrences of exact match', function () {
      let filter = DSLExpressionPart.exact;

      expect(DSLUtil.findNodesByFilter(this.ast, filter)).toEqual(this.exact);
    });

  });

  describe('#findNodesByFilter', function () {

    beforeEach(function () {
      this.propTypes = {
        attr: DSLExpressionPart.attrib('is', 'foo'),
        exact: DSLExpressionPart.exact,
        fuzzy: DSLExpressionPart.fuzzy
      };
    });

    it('should set `true` on existing attributes', function () {
      const ast = SearchDSL.parse('is:foo').ast;

      expect(DSLUtil.getPropTypeValues(ast, this.propTypes)).toEqual({
        attr: true,
        exact: null,
        fuzzy: null
      });
    });

    it('should set the string value of exact matches', function () {
      const ast = SearchDSL.parse('"this is a test"').ast;

      expect(DSLUtil.getPropTypeValues(ast, this.propTypes)).toEqual({
        attr: false,
        exact: 'this is a test',
        fuzzy: null
      });
    });

    it('should set the string value of fuzzy matches', function () {
      const ast = SearchDSL.parse('foo bar token').ast;

      expect(DSLUtil.getPropTypeValues(ast, this.propTypes)).toEqual({
        attr: false,
        exact: null,
        fuzzy: 'foo bar token'
      });
    });

    it('should properly handle more than one property in expression', function () {
      const ast = SearchDSL.parse('foo "exact" is:foo bar token').ast;

      expect(DSLUtil.getPropTypeValues(ast, this.propTypes)).toEqual({
        attr: true,
        exact: 'exact',
        fuzzy: 'foo bar token'
      });
    });

  });

  describe('#getNodeString', function () {

    it('should correctly return the string of attrib nodes', function () {
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.ATTRIB, {
        label: 'label', text: 'text'
      });

      expect(DSLUtil.getNodeString(node)).toEqual('label:text');
    });

    it('should correctly return the string of fuzzy nodes', function () {
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.FUZZY, {
        text: 'text'
      });

      expect(DSLUtil.getNodeString(node)).toEqual('text');
    });

    it('should correctly return the string of exact nodes', function () {
      let node = new DSLASTNodes.FilterNode(0, 0, DSLFilterTypes.EXACT, {
        text: 'text'
      });

      expect(DSLUtil.getNodeString(node)).toEqual('"text"');
    });

  });

});
