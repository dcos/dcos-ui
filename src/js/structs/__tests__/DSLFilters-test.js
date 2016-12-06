jest.dontMock('../DSLFilter');
jest.dontMock('../DSLFilters');
const DSLFilter = require('../DSLFilter');
const DSLFilters = require('../DSLFilters');

describe('DSLFilters', function () {

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

    filters = filters.add(matchInst);
    filters = filters.add(unmatchInst);

    expect(filters.getMatchingFilters(0, {})).toEqual([
      matchInst
    ]);
  });

});
