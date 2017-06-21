jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../ServiceNameTextFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var ServiceNameTextFilter = require("../ServiceNameTextFilter");
var List = require("../../../../../../src/js/structs/List");

describe("ServiceNameTextFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getName() {
          return "foo service";
        }
      },
      {
        getName() {
          return "bar service";
        }
      },
      {
        getName() {
          return "foo bar service";
        }
      }
    ];
  });

  it("Should match parts of service name", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("foo");

    const filters = new DSLFilterList().add(new ServiceNameTextFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0],
      this.mockItems[2]
    ]);
  });

  it("Should match exact parts of service name", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse('"foo bar"');

    const filters = new DSLFilterList().add(new ServiceNameTextFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });
});
