jest.dontMock('../SearchDSL.jison');
jest.dontMock('../../../js/utils/DSLParserUtil');

const SearchDSL = require('../SearchDSL.jison');
const DSLFilterTypes = require('../../../js/constants/DSLFilterTypes');
const DSLCombinerTypes = require('../../../js/constants/DSLCombinerTypes');

describe('SearchDSL', function () {

  describe('Metadata', function () {

    describe('Filters (Operands)', function () {

      it('should parse fuzzy text', function () {
        let expr = SearchDSL.parse('fuzzy');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.filterParams.text).toEqual('fuzzy');
      });

      it('should parse exact text', function () {
        let expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.EXACT);
        expect(expr.ast.filterParams.text).toEqual('exact string');
      });

      it('should parse attributes', function () {
        let expr = SearchDSL.parse('attrib:value');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.filterParams.text).toEqual('value');
        expect(expr.ast.filterParams.label).toEqual('attrib');
      });

    });

    describe('Combiners (Operators)', function () {

      it('should use AND operator by default', function () {
        let expr = SearchDSL.parse('text1 text2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.AND);
      });

      it('should properly use OR operator', function () {
        let expr = SearchDSL.parse('text1, text2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
      });

      it('should properly use OR shorthand operator on attrib', function () {
        // NOTE: attrib:value1,value2 becomes -> attrib:value1, attrib:value2
        let expr = SearchDSL.parse('attrib:value1,value2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[0].filterParams.text).toEqual('value1');
        expect(expr.ast.children[0].filterParams.label).toEqual('attrib');
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[1].filterParams.text).toEqual('value2');
        expect(expr.ast.children[1].filterParams.label).toEqual('attrib');
      });

      it('should correctly populate children', function () {
        let expr = SearchDSL.parse('text1 text2');
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[0].filterParams.text).toEqual('text1');
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].filterParams.text).toEqual('text2');
      });

    });

    describe('Complex expressions', function () {

      it('should nest operations in correct order', function () {
        let expr = SearchDSL.parse('text1 text2, (text3 (text4 text5), text6)');

        // .       : [text1 text2] OR [(text3 (text4 text5), text6)]
        expect(expr.ast.combinerType)
          .toEqual(DSLCombinerTypes.OR);

        // .0      : [text1] AND [text2]
        expect(expr.ast.children[0].combinerType)
          .toEqual(DSLCombinerTypes.AND);

        // .0.0    : text1
        expect(expr.ast.children[0].children[0].filterType)
          .toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[0].children[0].filterParams.text)
          .toEqual('text1');

        // .0.1    : text2
        expect(expr.ast.children[0].children[1].filterType)
          .toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[0].children[1].filterParams.text)
          .toEqual('text2');

        // .1      : [text3 (text4 text5)] OR [text6]
        expect(expr.ast.children[1].combinerType)
          .toEqual(DSLCombinerTypes.OR);

        // .1.0    : [text3] AND [text4 text5]
        expect(expr.ast.children[1].children[0].combinerType)
          .toEqual(DSLCombinerTypes.AND);

        // .1.0.0  : text3
        expect(expr.ast.children[1].children[0].children[0].filterType)
          .toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].children[0].children[0].filterParams.text)
          .toEqual('text3');

        // .1.0.1  : [text4] AND [text5]
        expect(expr.ast.children[1].children[0].children[1].combinerType)
          .toEqual(DSLCombinerTypes.AND);

        // .1.0.1.0: text4
        expect(expr.ast.children[1].children[0].children[1].children[0]
          .filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].children[0].children[1].children[0]
          .filterParams.text).toEqual('text4');

        // .1.0.1.1: text5
        expect(expr.ast.children[1].children[0].children[1].children[1]
          .filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].children[0].children[1].children[1]
          .filterParams.text).toEqual('text5');

        // .1.1    : text6
        expect(expr.ast.children[1].children[1].filterType)
          .toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].children[1].filterParams.text)
          .toEqual('text6');

      });

    });

    describe('Token positions', function () {

      it('should properly track location of fuzzy text', function () {
        let expr = SearchDSL.parse('fuzzy');
        expect(expr.ast.position).toEqual([[0, 5]]);
      });

      it('should properly track location of exact text', function () {
        let expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.position).toEqual([[0, 14]]);
      });

      it('should properly track location of attrib', function () {
        let expr = SearchDSL.parse('attrib:value');
        expect(expr.ast.position).toEqual([[0, 7], [7, 12]]);
      });

      it('should properly track location of attrib with multi values', function () {
        let expr = SearchDSL.parse('attrib:value1,value2');
        expect(expr.ast.children[1].position).toEqual([[0, 7], [14, 20]]);
      });

    });

  });

});
