var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var NodesRegionFilter = require("../NodesRegionFilter");
var List = require("#SRC/js/structs/List");

describe("NodesRegionFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getRegionName() {
          return "region-1";
        }
      },
      {
        getRegionName() {
          return "region-22";
        }
      }
    ];
  });

  it("keeps nodes with specific region mentioned", function() {
    const nodes = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = new DSLFilterList().add(
      new NodesRegionFilter(["region-1"])
    );

    expect(expr.filter(filters, nodes).getItems()[0].getRegionName()).toEqual(
      this.mockItems[0].getRegionName()
    );
  });
});
