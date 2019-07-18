var Application = require("../../structs/Application");

var Framework = require("../../structs/Framework");
var List = require("#SRC/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var ServiceAttributeIsPodFilter = require("../ServiceAttributeIsPodFilter");

let thisMockItems;

describe("ServiceAttributeIsPodFilter", function() {
  beforeEach(function() {
    thisMockItems = [new Framework(), new Application(), new Pod()];
  });

  it("matches Pod instances", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:pod");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });

  it("keeps nothing on unknown values", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:pOd");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });
});
