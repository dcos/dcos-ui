import List from "#SRC/js/structs/List";
import NodesTextFilter from "../NodesTextFilter";

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");

let thisMockItems;

describe("NodesTextFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        getHostName: () => "10.0.1.214"
      },
      {
        getHostName: () => "10.0.7.139"
      },
      {
        getHostName: () => "10.1.8.229"
      }
    ];
  });

  it("matches parts of host name", () => {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("10.0");

    const filters = [new NodesTextFilter()];

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      thisMockItems[0],
      thisMockItems[1]
    ]);
  });

  it("matches exact parts of host name", () => {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse('"10.1.8.229"');

    const filters = [new NodesTextFilter()];

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[2]]);
  });
});
