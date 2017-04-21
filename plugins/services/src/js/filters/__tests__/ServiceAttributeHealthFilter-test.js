jest.dontMock("#SRC/js/structs/DSLFilterList");
jest.dontMock("#SRC/resources/grammar/SearchDSL.jison");
jest.dontMock("../../constants/HealthStatus");
jest.dontMock("../ServiceAttributeHealthFilter");
jest.dontMock("#SRC/js/structs/List");

var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var HealthStatus = require("../../constants/HealthStatus");
var ServiceAttributeHealthFilter = require("../ServiceAttributeHealthFilter");
var List = require("#SRC/js/structs/List");

describe("ServiceAttributeHealthFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getHealth() {
          return HealthStatus.HEALTHY;
        }
      },
      {
        getHealth() {
          return HealthStatus.UNHEALTHY;
        }
      },
      {
        getHealth() {
          return HealthStatus.IDLE;
        }
      },
      {
        getHealth() {
          return HealthStatus.NA;
        }
      }
    ];
  });

  it("Should correctly keep services in healthy state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:healthy");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep services in unhealthy state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:unhealthy");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });

  it("Should correctly keep nothing on unknown states", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:hEaLThY");

    const filters = new DSLFilterList([new ServiceAttributeHealthFilter()]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
