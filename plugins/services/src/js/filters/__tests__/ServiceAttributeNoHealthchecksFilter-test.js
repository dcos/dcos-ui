import { SearchDSL } from "@d2iq/dsl-filter";
var HealthStatus = require("../../constants/HealthStatus");
var ServiceAttributeNoHealthchecksFilter = require("../ServiceAttributeNoHealthchecksFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("ServiceAttributeNoHealthchecksFilter", function() {
  beforeEach(function() {
    thisMockItems = [
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

  it("keeps services without health checks", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:healthchecks");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[3]
    ]);
  });

  it("keeps nothing on unknown states", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:boo");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:HeaLThchEckS");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[3]
    ]);
  });
});
