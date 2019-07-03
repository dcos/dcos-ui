const DSLFilter = require("../DSLFilter");
const DSLFilterList = require("../DSLFilterList");

describe("DSLFilterList", function() {
  it("returns only matching filters", function() {
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

    const matchInst = new MatchFilter();
    const unmatchInst = new UnmatchFilter();
    const filters = new DSLFilterList([matchInst, unmatchInst]);

    expect(filters.getMatchingFilters(0, {})).toEqual([matchInst]);
  });
});
