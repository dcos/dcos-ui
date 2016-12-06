jest.dontMock('../DSLFilter');
jest.dontMock('../DSLFilterList');
const DSLFilter = require('../DSLFilter');
const DSLFilterList = require('../DSLFilterList');

describe('DSLFilterList', function () {

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

    filters = filters.add(matchInst, unmatchInst);

    expect(filters.getMatchingFilters(0, {})).toEqual([
      matchInst
    ]);
  });

});
