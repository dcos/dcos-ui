var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var NodesZoneFilter = require("../NodesZoneFilter");
var List = require("#SRC/js/structs/List");

describe("NodesZoneFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getZoneName() {
          return "zone-1";
        }
      },
      {
        getZoneName() {
          return "zone-2";
        }
      }
    ];
  });

  it("keeps nodes with specific zone mentioned", function() {
    const nodes = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = new DSLFilterList().add(new NodesZoneFilter(["zone-1"]));

    expect(expr.filter(filters, nodes).getItems()[0].getZoneName()).toEqual(
      this.mockItems[0].getZoneName()
    );
  });
});
