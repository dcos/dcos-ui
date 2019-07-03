jest.mock("../../utils/TaskUtil");

var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var TasksRegionFilter = require("../TasksRegionFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

let thisMockItems;

describe("TaskRegionFilter", function() {
  beforeEach(function() {
    TaskUtil.getNode = function(item) {
      return item;
    };
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

  it("keeps tasks with specific region mentioned", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = new DSLFilterList([new TasksRegionFilter(["region-1"])]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
