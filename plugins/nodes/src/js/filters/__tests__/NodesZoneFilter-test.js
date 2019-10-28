import { SearchDSL } from "@d2iq/dsl-filter";
var NodesZoneFilter = require("../NodesZoneFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("NodesZoneFilter", function() {
  beforeEach(function() {
    thisMockItems = [
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
    const nodes = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = [new NodesZoneFilter(["zone-1"])];

    expect(
      expr
        .filter(filters, nodes)
        .getItems()[0]
        .getZoneName()
    ).toEqual(thisMockItems[0].getZoneName());
  });
});
