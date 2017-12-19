var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TasksStatusFilter = require("../TasksStatusFilter");
var List = require("#SRC/js/structs/List");

describe("TaskStatusFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        state: "TASK_RUNNING"
      },
      {
        state: "TASK_COMPLETE"
      }
    ];
  });

  it("Should correctly keep tasks in active state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:active");

    const filters = new DSLFilterList().add(new TasksStatusFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep tasks in completed state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:completed");

    const filters = new DSLFilterList().add(new TasksStatusFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });
});
