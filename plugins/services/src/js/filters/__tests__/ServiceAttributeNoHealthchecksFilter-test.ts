import List from "#SRC/js/structs/List";
import HealthStatus from "../../constants/HealthStatus";
import ServiceAttributeNoHealthchecksFilter from "../ServiceAttributeNoHealthchecksFilter";

import SearchDSL from "#SRC/resources/grammar/SearchDSL";

let thisMockItems;

describe("ServiceAttributeNoHealthchecksFilter", () => {
  beforeEach(() => {
    thisMockItems = [
      {
        getHealth() {
          return HealthStatus.HEALTHY;
        },
      },
      {
        getHealth() {
          return HealthStatus.UNHEALTHY;
        },
      },
      {
        getHealth() {
          return HealthStatus.IDLE;
        },
      },
      {
        getHealth() {
          return HealthStatus.NA;
        },
      },
    ];
  });

  it("keeps services without health checks", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:healthchecks");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[3],
    ]);
  });

  it("keeps nothing on unknown states", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:boo");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("no:HeaLThchEckS");

    const filters = [new ServiceAttributeNoHealthchecksFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[3],
    ]);
  });
});
