var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TaskNameTextFilter = require("../TaskNameTextFilter");
var List = require("#SRC/js/structs/List");

describe("TaskNameTextFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        name: "cassandra"
      },
      {
        name: "node-1-server__1"
      },
      {
        name: "node-0-server__2"
      }
    ];
  });

  it("Should match parts of task name", function() {
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("node");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      this.mockItems[1],
      this.mockItems[2]
    ]);
  });

  it("Should match exact parts of task name", function() {
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse('"cassandra"');

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([this.mockItems[0]]);
  });
});
