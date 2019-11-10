jest.mock("../../utils/TaskUtil");

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var TasksRegionFilter = require("../TasksRegionFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

let thisMockItems;

describe("TaskRegionFilter", () => {
  beforeEach(() => {
    TaskUtil.getNode = item => item;
    thisMockItems = [
      {
        getRegionName() {
          return "region-1";
        }
      },
      {
        getRegionName() {
          return "region-2";
        }
      }
    ];
  });

  it("keeps tasks with specific region mentioned", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = [new TasksRegionFilter(["region-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
