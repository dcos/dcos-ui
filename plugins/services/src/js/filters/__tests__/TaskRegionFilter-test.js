jest.mock("../../utils/TaskUtil");

var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TasksRegionFilter = require("../TasksRegionFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

describe("TaskRegionFilter", function() {
  beforeEach(function() {
    TaskUtil.getNode = function(item) {
      return item;
    };
    this.mockItems = [
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
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("region:region-1");

    const filters = new DSLFilterList().add(
      new TasksRegionFilter(["region-1"])
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
