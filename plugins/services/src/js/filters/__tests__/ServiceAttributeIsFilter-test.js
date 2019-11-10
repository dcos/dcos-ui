import * as ServiceStatus from "../../constants/ServiceStatus";

var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var ServiceAttributeIsFilter = require("../ServiceAttributeIsFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("ServiceAttributeIsFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        getServiceStatus() {
          return ServiceStatus.DEPLOYING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.RUNNING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.STOPPED;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.NA;
        }
      }
    ];
  });

  it("keeps services in deploying state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:deploying");

    const filters = [new ServiceAttributeIsFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps services in running state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:running");

    const filters = [new ServiceAttributeIsFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });

  it("keeps services in stopped state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:stopped");

    const filters = [new ServiceAttributeIsFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });

  it("keeps nothing on unknown states", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = [new ServiceAttributeIsFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:dEpLOYING");

    const filters = [new ServiceAttributeIsFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
