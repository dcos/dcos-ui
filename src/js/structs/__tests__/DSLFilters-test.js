jest.dontMock('../DSLFilter');
jest.dontMock('../DSLFilters');
const DSLFilter = require('../DSLFilter');
const DSLFilters = require('../DSLFilters');

describe('DSLFilters', function () {

  it('should add filters with plug()', function () {
    const SAMPLE_FILTER = {};
    let filters = new DSLFilters();
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
    let filters = new DSLFilters();

    filters.plug(matchInst);
    filters.plug(unmatchInst);

    expect(filters.getMatchingFilters(0, {})).toEqual([
      matchInst
    ]);
  });

});
