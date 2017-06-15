jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../ServiceAttributeIsPodFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var Application = require("../../structs/Application");
var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var Framework = require("../../structs/Framework");
var List = require("../../../../../../src/js/structs/List");
var Pod = require("../../structs/Pod");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var ServiceAttributeIsPodFilter = require("../ServiceAttributeIsPodFilter");

describe("ServiceAttributeIsPodFilter", function() {
  beforeEach(function() {
    this.mockItems = [new Framework(), new Application(), new Pod()];
  });

  it("Should match Pod instances", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:pod");

    const filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it("Should correctly keep nothing on unknown values", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:pOd");

    const filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });
});
