jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../../constants/HealthStatus");
jest.dontMock("../ServiceAttributeNoHealthchecksFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var HealthStatus = require("../../constants/HealthStatus");
var ServiceAttributeNoHealthchecksFilter = require("../ServiceAttributeNoHealthchecksFilter");
var List = require("../../../../../../src/js/structs/List");

describe("ServiceAttributeNoHealthchecksFilter", function() {
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

  it("Should correctly keep services without health checks", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("no:healthchecks");

    const filters = new DSLFilterList().add(
      new ServiceAttributeNoHealthchecksFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });

  it("Should correctly keep nothing on unknown states", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("no:boo");

    const filters = new DSLFilterList().add(
      new ServiceAttributeNoHealthchecksFilter()
    );

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("no:HeaLThchEckS");

    const filters = new DSLFilterList([
      new ServiceAttributeNoHealthchecksFilter()
    ]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });
});
