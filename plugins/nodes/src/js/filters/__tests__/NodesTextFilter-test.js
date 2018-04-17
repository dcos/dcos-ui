var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var NodesTextFilter = require("../NodesTextFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("NodesTextFilter", function() {
  beforeEach(function() {
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

  it("matches parts of host name", function() {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("10.0");

    const filters = new DSLFilterList().add(new NodesTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      thisMockItems[0],
      thisMockItems[1]
    ]);
  });

  it("matches exact parts of host name", function() {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse('"10.1.8.229"');

    const filters = new DSLFilterList().add(new NodesTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[2]]);
  });
});
