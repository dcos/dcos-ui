import List from "#SRC/js/structs/List";
import TaskNameTextFilter from "../TaskNameTextFilter";

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");

let thisMockItems;

describe("TaskNameTextFilter", () => {
  beforeEach(() => {
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

  it("matches parts of task name", () => {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("node");

    const filters = [new TaskNameTextFilter()];

    expect(expr.filter(filters, tasks).getItems()).toEqual([
      thisMockItems[1],
      thisMockItems[2]
    ]);
  });

  it("matches parts of task id", () => {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("d9a23");

    const filters = [new TaskNameTextFilter()];

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[0]]);
  });

  it("matches exact parts of task name", () => {
    const tasks = new List({ items: thisMockItems });
    const expr = SearchDSL.parse('"cassandra"');

    const filters = [new TaskNameTextFilter()];

    expect(expr.filter(filters, tasks).getItems()).toEqual([thisMockItems[0]]);
  });
});
