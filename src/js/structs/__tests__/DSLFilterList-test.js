jest.dontMock('../DSLFilter');
jest.dontMock('../DSLFilterList');
const DSLFilter = require('../DSLFilter');
const DSLFilterList = require('../DSLFilterList');

describe('DSLFilterList', function () {

  it('should add filters with plug()', function () {
    const SAMPLE_FILTER = {};
    let filters = new DSLFilterList();
    filters.plug(SAMPLE_FILTER);

    expect(filters.filters).toEqual([
      SAMPLE_FILTER
    ]);
  });

  it('should return only matching filters', function () {
    class MatchFilter extends DSLFilter {
      filterCanHandle() {
        return false;
      }
    }

    class UnmatchFilter extends DSLFilter {
      filterCanHandle() {
        return true;
      }
    }

    let matchInst = new MatchFilter();
    let unmatchInst = new UnmatchFilter();
    let filters = new DSLFilterList();

    filters.plug(matchInst, unmatchInst);

    expect(filters.getMatchingFilters(0, {})).toEqual([
      matchInst
    ]);
  });

});
