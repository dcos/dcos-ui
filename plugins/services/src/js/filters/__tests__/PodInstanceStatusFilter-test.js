var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var PodInstanceStatusFilter = require("../PodInstanceStatusFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("PodInstanceStatusFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        isStaging: () => false,
        isRunning: () => true
      },
      {
        state: "TASK_FINISHED",
        isStaging: () => false,
        isRunning: () => false
      }
    ];
  });

  it("keeps tasks in active state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:active");

    const filters = [new PodInstanceStatusFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps tasks in completed state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:completed");

    const filters = [new PodInstanceStatusFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });
});
