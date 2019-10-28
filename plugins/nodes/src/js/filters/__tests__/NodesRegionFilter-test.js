import { SearchDSL } from "@d2iq/dsl-filter";
import List from "#SRC/js/structs/List";

import NodesRegionFilter from "../NodesRegionFilter";

let thisMockItems;

describe("NodesRegionFilter", function() {
  beforeEach(function() {
    thisMockItems = [
      { getRegionName: () => "region-1" },
      { getRegionName: () => "region-22" }
    ];
  });

  it("keeps nodes with specific region mentioned", function() {
    const nodes = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = [NodesRegionFilter];

    expect(
      expr
        .filter(filters, nodes)
        .getItems()[0]
        .getRegionName()
    ).toEqual(thisMockItems[0].getRegionName());
  });
});
