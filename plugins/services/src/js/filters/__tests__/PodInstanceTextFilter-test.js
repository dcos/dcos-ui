jest.mock("../../utils/TaskUtil");

var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var PodInstancesZoneFilter = require("../PodInstancesZoneFilter");
var List = require("#SRC/js/structs/List");
var InstanceUtil = require("../../utils/InstanceUtil");

let thisMockItems;

describe("PodInstancesZoneFilter", function() {
  beforeEach(function() {
    InstanceUtil.getNode = function(item) {
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

    const filters = new DSLFilterList().add(
      new PodInstancesZoneFilter(["zone-1"])
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
