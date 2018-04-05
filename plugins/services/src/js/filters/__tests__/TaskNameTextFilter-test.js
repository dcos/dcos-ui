var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TaskNameTextFilter = require("../TaskNameTextFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("TaskNameTextFilter", function() {
  beforeEach(function() {
    thisMockItems = [
      {
        id: "cassandra.d9a2318d",
        name: "cassandra"
      },
      {
        id: "",
        name: "node-1-server__1"
      },
      {
        id: "",
        name: "node-0-server__2"
      }
    ];
  });

  it("matches parts of task name", function() {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("node");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      thisMockItems[1],
      thisMockItems[2]
    ]);
  });

  it("matches parts of task id", function() {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("d9a23");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[0]]);
  });

  it("matches exact parts of task name", function() {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse('"cassandra"');

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[0]]);
  });
});
