import List from "#SRC/js/structs/List";
import HealthStatus from "../../constants/HealthStatus";
import ServiceAttributeHealthFilter from "../ServiceAttributeHealthFilter";

import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("ServiceAttributeHealthFilter", () => {
  beforeEach(() => {
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

  it("keeps services in healthy state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:healthy");

    const filters = [new ServiceAttributeHealthFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });

  it("keeps services in unhealthy state", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:unhealthy");

    const filters = [new ServiceAttributeHealthFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[1]
    ]);
  });

  it("keeps nothing on unknown states", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = [new ServiceAttributeHealthFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("is:hEaLThY");

    const filters = [new ServiceAttributeHealthFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0]
    ]);
  });
});
