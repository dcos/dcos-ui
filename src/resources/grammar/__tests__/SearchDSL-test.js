jest.dontMock('../SearchDSL.jison');
jest.dontMock('../../../js/utils/DSLParserUtil');
jest.dontMock('../../../js/structs/DSLFilter');
jest.dontMock('../../../js/structs/DSLFilterList');
jest.dontMock('../../../js/structs/List');

const DSLFilterTypes = require('../../../js/constants/DSLFilterTypes');
const DSLCombinerTypes = require('../../../js/constants/DSLCombinerTypes');
const DSLFilter = require('../../../js/structs/DSLFilter');
const DSLFilterList = require('../../../js/structs/DSLFilterList');
const List = require('../../../js/structs/List');
const SearchDSL = require('../SearchDSL.jison');

// Handles 'attrib:?'
class AttribFilter extends DSLFilter {
  filterCanHandle(filterType, filterArguments) {
    return filterType === DSLFilterTypes.ATTRIB &&
           filterArguments.label === 'attrib';
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filterItems((item) => {
      return item.attrib.indexOf(filterArguments.text) !== -1;
    });
  }
};

// Handles 'text'
class FuzzyTextFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.FUZZY;
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filterItems((item) => {
      return item.text.indexOf(filterArguments.text) !== -1;
    });
  }
};

// Handles '"text"'
class ExactTextFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.EXACT;
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filterItems((item) => {
      return item.text === filterArguments.text;
    });
  }
};

describe('SearchDSL', function () {

  describe('Metadata', function () {

    describe('Filters (Operands)', function () {

      it('should parse fuzzy text', function () {
        const expr = SearchDSL.parse('fuzzy');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.filterParams.text).toEqual('fuzzy');
      });

      it('should parse exact text', function () {
        const expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.EXACT);
        expect(expr.ast.filterParams.text).toEqual('exact string');
      });

      it('should parse attributes', function () {
        const expr = SearchDSL.parse('attrib:value');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.filterParams.text).toEqual('value');
        expect(expr.ast.filterParams.label).toEqual('attrib');
      });

    });

    describe('Combiners (Operators)', function () {

      it('should use AND operator by default', function () {
        const expr = SearchDSL.parse('text1 text2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.AND);
      });

      it('should properly use OR operator', function () {
        const expr = SearchDSL.parse('text1, text2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
      });

      it('should properly use OR shorthand operator on attrib', function () {
        // NOTE: attrib:value1,value2 becomes -> attrib:value1, attrib:value2
        const expr = SearchDSL.parse('attrib:value1,value2');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[0].filterParams.text).toEqual('value1');
        expect(expr.ast.children[0].filterParams.label).toEqual('attrib');
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[1].filterParams.text).toEqual('value2');
        expect(expr.ast.children[1].filterParams.label).toEqual('attrib');
      });

      it('should properly handle OR shorthand + OR with other operands', function () {
        // NOTE: attrib:value1,value2 becomes -> attrib:value1, attrib:value2
        const expr = SearchDSL.parse('attrib:value1,value2, foo');
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);

        expect(expr.ast.children[0].combinerType).toEqual(DSLCombinerTypes.OR);
        expect(expr.ast.children[0].children[0].filterType)
          .toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[0].children[0].filterParams.text)
          .toEqual('value1');
        expect(expr.ast.children[0].children[0].filterParams.label)
          .toEqual('attrib');
        expect(expr.ast.children[0].children[1].filterType)
          .toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[0].children[1].filterParams.text)
          .toEqual('value2');
        expect(expr.ast.children[0].children[1].filterParams.label)
          .toEqual('attrib');

        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].filterParams.text).toEqual('foo');
      });

      it('should correctly populate children', function () {
        const expr = SearchDSL.parse('text1 text2');
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[0].filterParams.text).toEqual('text1');
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].filterParams.text).toEqual('text2');
      });

    });

    describe('Complex expressions', function () {

      it('should nest operations in correct order', function () {
        const expr = SearchDSL.parse('text1 text2, (text3 (text4 text5), text6)');

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
        const expr = SearchDSL.parse('fuzzy');
        expect(expr.ast.position).toEqual([[0, 5]]);
      });

      it('should properly track location of exact text', function () {
        const expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.position).toEqual([[0, 14]]);
      });

      it('should properly track location of attrib', function () {
        const expr = SearchDSL.parse('attrib:value');
        expect(expr.ast.position).toEqual([[0, 7], [7, 12]]);
      });

      it('should properly track location of attrib with multi values', function () {
        const expr = SearchDSL.parse('attrib:value1,value2');
        expect(expr.ast.children[1].position).toEqual([[0, 7], [14, 20]]);
      });

    });

    describe('Filtering', function () {

      beforeEach(function () {
        this.filters = new DSLFilterList().add(
          new AttribFilter(),
          new FuzzyTextFilter(),
          new ExactTextFilter()
        );

        this.mockResultset = new List({items: [
          {text: 'some test string', attrib: ['a', 'b']},
          {text: 'repeating test string', attrib: ['b', 'c']},
          {text: 'some other string', attrib: ['c', 'd']}
        ]});
      });

      it('should properly filter by fuzzy match', function () {
        const expr = SearchDSL.parse('test');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']},
          {text: 'repeating test string', attrib: ['b', 'c']}
        ]);
      });

      it('should properly filter by exact match', function () {
        const expr = SearchDSL.parse('"some other string"');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some other string', attrib: ['c', 'd']}
        ]);
      });

      it('should properly filter by attribute', function () {
        const expr = SearchDSL.parse('attrib:b');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']},
          {text: 'repeating test string', attrib: ['b', 'c']}
        ]);
      });

      it('should combine with OR operator with multi-value attr', function () {
        const expr = SearchDSL.parse('attrib:a,b');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']},
          {text: 'repeating test string', attrib: ['b', 'c']}
        ]);
      });

      it('should combine with OR operator multiple attr', function () {
        const expr = SearchDSL.parse('attrib:a, attrib:b');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']},
          {text: 'repeating test string', attrib: ['b', 'c']}
        ]);
      });

      it('should combine with AND operator multiple attr', function () {
        const expr = SearchDSL.parse('attrib:a attrib:b');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']}
        ]);
      });

      it('should combine with AND operator multiple attr', function () {
        const expr = SearchDSL.parse('attrib:a attrib:b');

        expect(expr.filter(this.filters, this.mockResultset).getItems()).toEqual([
          {text: 'some test string', attrib: ['a', 'b']}
        ]);
      });

    });

  });

});
