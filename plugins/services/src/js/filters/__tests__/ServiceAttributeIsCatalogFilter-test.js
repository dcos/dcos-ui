jest.dontMock("#SRC/js/structs/DSLFilterList");
jest.dontMock("#SRC/resources/grammar/SearchDSL.jison");
jest.dontMock("../ServiceAttributeIsCatalogFilter");
jest.dontMock("#SRC/js/structs/List");

var Application = require("../../structs/Application");
var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var Framework = require("../../structs/Framework");
var List = require("#SRC/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var ServiceAttributeIsCatalogFilter = require("../ServiceAttributeIsCatalogFilter");

describe("ServiceAttributeIsCatalogFilter", function() {
  beforeEach(function() {
    this.mockItems = [new Framework(), new Application(), new Pod()];
  });

  it("Should match Framework instances", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:catalog");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep nothing on unknown values", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:CataLOg");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
