var Application = require("../../structs/Application");

var Framework = require("../../structs/Framework");
var List = require("#SRC/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var ServiceAttributeIsPodFilter = require("../ServiceAttributeIsPodFilter");

let thisMockItems;

describe("ServiceAttributeIsPodFilter", () => {
  beforeEach(() => {
    thisMockItems = [new Framework(), new Application(), new Pod()];
  });

  it("matches Pod instances", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:pod");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });

  it("keeps nothing on unknown values", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:pOd");

    const filters = [new ServiceAttributeIsPodFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });
});
