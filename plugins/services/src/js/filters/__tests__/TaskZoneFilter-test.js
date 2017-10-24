jest.mock("../../utils/TaskUtil");

var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var TasksZoneFilter = require("../TasksZoneFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

describe("TasksZoneFilter", function() {
  beforeEach(function() {
    TaskUtil.getNode = function(item) {
      return item;
    };
    this.mockItems = [
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

  it("Should correctly keep tasks with specific zone mentioned", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = new DSLFilterList().add(new TasksZoneFilter(["zone-1"]));

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
