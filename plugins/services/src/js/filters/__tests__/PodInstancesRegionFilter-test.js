jest.mock("../../utils/TaskUtil");

import { SearchDSL } from "@d2iq/dsl-filter";
var PodInstancesRegionFilter = require("../PodInstancesRegionFilter");
var List = require("#SRC/js/structs/List");
var InstanceUtil = require("../../utils/InstanceUtil");

let thisMockItems;

describe("PodInstancesRegionFilter", function() {
  beforeEach(function() {
    InstanceUtil.getNode = function(item) {
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

    const filters = [new PodInstancesRegionFilter(["region-1"])];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
