var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TaskNameTextFilter = require("../TaskNameTextFilter");
var List = require("#SRC/js/structs/List");

describe("TaskNameTextFilter", function() {
  beforeEach(function() {
    this.mockItems = [
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
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("node");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      this.mockItems[1],
      this.mockItems[2]
    ]);
  });

  it("matches parts of task id", function() {
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("d9a23");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([this.mockItems[0]]);
  });

  it("matches exact parts of task name", function() {
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("d9a23");

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([this.mockItems[0]]);
  });

  it("matches exact parts of task name", function() {
    const tasks = new List({ items: this.mockItems });
    const expr = SearchDSL.parse('"cassandra"');

    const filters = new DSLFilterList().add(new TaskNameTextFilter());

    expect(expr.filter(filters, tasks).getItems()).toEqual([this.mockItems[0]]);
  });
});
