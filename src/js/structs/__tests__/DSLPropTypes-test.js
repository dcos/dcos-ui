jest.dontMock('../DSLPropTypes');
const DSLFilterTypes = require('../../constants/DSLFilterTypes');
const DSLPropTypes = require('../DSLPropTypes');

describe('DSLPropTypes', function () {

  it('should correct create an .attrib(\'label\') filter', function () {
    let ret = DSLPropTypes.attrib('label');

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({label: 'label'});
  });

  it('should correct create an .attrib(\'label\', \'text\') filter', function () {
    let ret = DSLPropTypes.attrib('label', 'text');

    expect(ret.filterType).toEqual(DSLFilterTypes.ATTRIB);
    expect(ret.filterParams).toEqual({label: 'label', text: 'text'});
  });

  it('should correct create an .exact filter', function () {
    let ret = DSLPropTypes.exact;

    expect(ret.filterType).toEqual(DSLFilterTypes.EXACT);
    expect(ret.filterParams).toEqual({});
  });

  it('should correct create an .fuzzy filter', function () {
    let ret = DSLPropTypes.fuzzy;

    expect(ret.filterType).toEqual(DSLFilterTypes.FUZZY);
    expect(ret.filterParams).toEqual({});
  });

});
