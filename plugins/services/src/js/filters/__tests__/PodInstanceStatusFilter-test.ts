import List from "#SRC/js/structs/List";
import PodInstanceStatusFilter from "../PodInstanceStatusFilter";

import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("PodInstanceStatusFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        isStaging: () => false,
        isRunning: () => true,
      },
      {
        state: "TASK_FINISHED",
        isStaging: () => false,
        isRunning: () => false,
      },
    ];
  });

  it("keeps tasks in active state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:active");

    const filters = [PodInstanceStatusFilter];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0],
    ]);
  });

  it("keeps tasks in completed state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:completed");

    const filters = [PodInstanceStatusFilter];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1],
    ]);
  });
});
