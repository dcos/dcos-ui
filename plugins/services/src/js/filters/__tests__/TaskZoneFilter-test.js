jest.mock("../../utils/TaskUtil");

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var TasksZoneFilter = require("../TasksZoneFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

let thisMockItems;

describe("TasksZoneFilter", () => {
  beforeEach(() => {
    TaskUtil.getNode = item => {
      return item;
    };
    thisMockItems = [
      {
        getZoneName() {
          return "zone-1";
        }
      },
      {
        getZoneName() {
          return "zone-2";
        }
      }
    ];
  });

  it("keeps tasks with specific zone mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = [new TasksZoneFilter(["zone-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
