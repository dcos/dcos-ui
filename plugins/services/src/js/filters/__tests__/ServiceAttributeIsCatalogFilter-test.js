import List from "#SRC/js/structs/List";
import Application from "../../structs/Application";
import Framework from "../../structs/Framework";
import Pod from "../../structs/Pod";
import ServiceAttributeIsCatalogFilter from "../ServiceAttributeIsCatalogFilter";

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");

let thisMockItems;

describe("ServiceAttributeIsCatalogFilter", () => {
  beforeEach(() => {
    thisMockItems = [new Framework(), new Application(), new Pod()];
  });

  it("matches Framework instances", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:catalog");

    const filters = [new ServiceAttributeIsCatalogFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps nothing on unknown values", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = [new ServiceAttributeIsCatalogFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:CataLOg");

    const filters = [new ServiceAttributeIsCatalogFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
