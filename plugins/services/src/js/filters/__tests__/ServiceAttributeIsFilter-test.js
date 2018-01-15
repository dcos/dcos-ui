var DSLFilterList = require("#SRC/js/structs/DSLFilterList");
var SearchDSL = require("#SRC/resources/grammar/SearchDSL.jison");
var ServiceStatus = require("../../constants/ServiceStatus");
var ServiceAttributeIsFilter = require("../ServiceAttributeIsFilter");
var List = require("#SRC/js/structs/List");

describe("ServiceAttributeIsFilter", function() {
  beforeEach(function() {
    this.mockItems = [
      {
        getServiceStatus() {
          return ServiceStatus.DELAYED;
        }
      },
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
          return ServiceStatus.WAITING;
        }
      },
      {
        getServiceStatus() {
          return ServiceStatus.NA;
        }
      }
    ];
  });

  it("keeps services in delayed state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:delayed");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("keeps services in deploying state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:deploying");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });

  it("keeps services in running state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:running");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it("keeps services in stopped state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:stopped");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });

  it("keeps services in waiting state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:waiting");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[4]
    ]);
  });

  it("keeps services in n/a state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:na");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[5]
    ]);
  });

  it("keeps nothing on unknown states", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("is case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:dElAyED");

    const filters = new DSLFilterList([new ServiceAttributeIsFilter()]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
