var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TasksStatusFilter = require("../TasksStatusFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("TaskStatusFilter", function() {
  beforeEach(function() {
    thisMockItems = [
      {
        state: "TASK_RUNNING"
      },
      {
        state: "TASK_FINISHED"
      }
    ];
  });

  it("keeps tasks in active state", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:active");

    const filters = new DSLFilterList().add(new TasksStatusFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps tasks in completed state", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:completed");

    const filters = new DSLFilterList().add(new TasksStatusFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });
});
