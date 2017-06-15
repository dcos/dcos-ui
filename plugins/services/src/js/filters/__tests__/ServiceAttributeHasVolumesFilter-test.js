jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../ServiceAttributeHasVolumesFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var List = require("../../../../../../src/js/structs/List");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var ServiceAttributeHasVolumesFilter = require("../ServiceAttributeHasVolumesFilter");
var VolumeList = require("../../structs/VolumeList");

describe("ServiceAttributeHasVolumesFilter", function() {
  beforeEach(function() {
    this.mockItems = [
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

  it("Should match instances with volumes", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("has:volumes");

    const filters = new DSLFilterList().add(
      new ServiceAttributeHasVolumesFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1],
      this.mockItems[2]
    ]);
  });

  it("Should correctly keep nothing on unknown values", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("has:foo");

    const filters = new DSLFilterList().add(
      new ServiceAttributeHasVolumesFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("has:vOLumEs");

    const filters = new DSLFilterList().add(
      new ServiceAttributeHasVolumesFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1],
      this.mockItems[2]
    ]);
  });
});
