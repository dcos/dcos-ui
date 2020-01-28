import List from "#SRC/js/structs/List";
import NodesZoneFilter from "../NodesZoneFilter";

import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("NodesZoneFilter", () => {
  beforeEach(() => {
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

  it("keeps nodes with specific zone mentioned", () => {
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
