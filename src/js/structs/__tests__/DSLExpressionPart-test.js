jest.dontMock('../DSLExpressionPart');
const DSLFilterTypes = require('../../constants/DSLFilterTypes');
const DSLExpressionPart = require('../DSLExpressionPart');

describe('DSLExpressionPart', function () {

  it('should correct create an .attrib(\'label\') filter', function () {
    let ret = DSLExpressionPart.attrib('label');

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({label: 'label'});
  });

  it('should correct create an .attrib(\'label\', \'text\') filter', function () {
    let ret = DSLExpressionPart.attrib('label', 'text');

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({label: 'label', text: 'text'});
  });

  it('should correct create an .exact filter', function () {
    let ret = DSLExpressionPart.exact;

    expect(ret.filterType).toEqual(DSLFilterTypes.EXACT);
    expect(ret.filterParams).toEqual({});
  });

  it('should correct create an .fuzzy filter', function () {
    let ret = DSLExpressionPart.fuzzy;

    expect(ret.filterType).toEqual(DSLFilterTypes.FUZZY);
    expect(ret.filterParams).toEqual({});
  });

});
