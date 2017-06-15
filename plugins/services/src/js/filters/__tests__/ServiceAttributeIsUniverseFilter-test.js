jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../ServiceAttributeIsUniverseFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var Application = require("../../structs/Application");
var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var Framework = require("../../structs/Framework");
var List = require("../../../../../../src/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var ServiceAttributeIsUniverseFilter = require("../ServiceAttributeIsUniverseFilter");

describe("ServiceAttributeIsUniverseFilter", function() {
  beforeEach(function() {
    this.mockItems = [new Framework(), new Application(), new Pod()];
  });

  it("Should match Framework instances", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:universe");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsUniverseFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep nothing on unknown values", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsUniverseFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:UniVErSe");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsUniverseFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
