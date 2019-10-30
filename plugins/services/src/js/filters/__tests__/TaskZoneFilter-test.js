import { SearchDSL } from "@d2iq/dsl-filter";

jest.mock("../../utils/TaskUtil");

var TasksZoneFilter = require("../TasksZoneFilter");
var List = require("#SRC/js/structs/List");
var TaskUtil = require("../../utils/TaskUtil");

let thisMockItems;

describe("TasksZoneFilter", function() {
  beforeEach(function() {
    TaskUtil.getNode = function(item) {
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

  it("keeps tasks with specific zone mentioned", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("zone:zone-1");

    const filters = [new TasksZoneFilter(["zone-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
