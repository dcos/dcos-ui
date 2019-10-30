import { SearchDSL } from "@d2iq/dsl-filter";

var List = require("#SRC/js/structs/List");
var ServiceAttributeHasVolumesFilter = require("../ServiceAttributeHasVolumesFilter");
var VolumeList = require("../../structs/VolumeList");

let thisMockItems;

describe("ServiceAttributeHasVolumesFilter", function() {
  beforeEach(function() {
    thisMockItems = [
      {
        getVolumes() {
          return new VolumeList({ items: [] });
        }
      },
      {
        getVolumes() {
          return new VolumeList({ items: ["foo"] });
        }
      },
      {
        getVolumes() {
          return new VolumeList({ items: ["foo", "bar"] });
        }
      }
    ];
  });

  it("matches instances with volumes", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("has:volumes");

    const filters = [new ServiceAttributeHasVolumesFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1],
      thisMockItems[2]
    ]);
  });

  it("keeps nothing on unknown values", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("has:foo");

    const filters = [new ServiceAttributeHasVolumesFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("has:vOLumEs");

    const filters = [new ServiceAttributeHasVolumesFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1],
      thisMockItems[2]
    ]);
  });
});
