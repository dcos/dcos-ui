var SearchDSL = require("#SRC/resources/grammar/SearchDSL");
var ServiceNameTextFilter = require("../ServiceNameTextFilter");
var List = require("#SRC/js/structs/List");

let thisMockItems;

describe("ServiceNameTextFilter", () => {
  beforeEach(() => {
    thisMockItems = [
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

  it("matches parts of service name", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse("foo");

    const filters = [new ServiceNameTextFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[0],
      thisMockItems[2]
    ]);
  });

  it("matches exact parts of service name", () => {
    const services = new List({ items: thisMockItems });
    const expr = SearchDSL.parse('"foo bar"');

    const filters = [new ServiceNameTextFilter()];

    expect(expr.filter(filters, services).getItems()).toEqual([
      thisMockItems[2]
    ]);
  });
});
