var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var HealthStatus = require("../../constants/HealthStatus");
var ServiceAttributeHealthFilter = require("../ServiceAttributeHealthFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("ServiceAttributeHealthFilter", function() {
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

  it("keeps services in healthy state", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:healthy");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps services in unhealthy state", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:unhealthy");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });

  it("keeps nothing on unknown states", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeHealthFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:hEaLThY");

    const filters = new DSLFilterList([new ServiceAttributeHealthFilter()]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
