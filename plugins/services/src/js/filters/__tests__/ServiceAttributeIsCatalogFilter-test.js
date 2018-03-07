var Application = require("../../structs/Application");
var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var Framework = require("../../structs/Framework");
var List = require("#SRC/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var ServiceAttributeIsCatalogFilter = require("../ServiceAttributeIsCatalogFilter");

let thisMockItems;

describe("ServiceAttributeIsCatalogFilter", function() {
  beforeEach(function() {
    thisMockItems = [new Framework(), new Application(), new Pod()];
  });

  it("matches Framework instances", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:catalog");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps nothing on unknown values", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:CataLOg");

    const filters = new DSLFilterList().add(
      new ServiceAttributeIsCatalogFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
