import List from "#SRC/js/structs/List";
import TasksStatusFilter from "../TasksStatusFilter";

import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("TaskStatusFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        state: "TASK_RUNNING"
      },
      {
        state: "TASK_FINISHED"
      }
    ];
  });

  it("keeps tasks in active state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:active");

    const filters = [new TasksStatusFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps tasks in completed state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:completed");

    const filters = [new TasksStatusFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });
});
