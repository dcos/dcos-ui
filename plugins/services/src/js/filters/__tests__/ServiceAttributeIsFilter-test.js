jest.dontMock("../../../../../../src/js/structs/DSLFilterList");
jest.dontMock("../../../../../../src/resources/grammar/SearchDSL.jison");
jest.dontMock("../../constants/ServiceStatus");
jest.dontMock("../ServiceAttributeIsFilter");
jest.dontMock("../../../../../../src/js/structs/List");

var DSLFilterList = require("../../../../../../src/js/structs/DSLFilterList");
var SearchDSL = require("../../../../../../src/resources/grammar/SearchDSL.jison");
var ServiceStatus = require("../../constants/ServiceStatus");
var ServiceAttributeIsFilter = require("../ServiceAttributeIsFilter");
var List = require("../../../../../../src/js/structs/List");

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
          return ServiceStatus.SUSPENDED;
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

  it("Should correctly keep services in delayed state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:delayed");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it("Should correctly keep services in deploying state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:deploying");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });

  it("Should correctly keep services in running state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:running");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it("Should correctly keep services in suspended state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:suspended");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });

  it("Should correctly keep services in waiting state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:waiting");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[4]
    ]);
  });

  it("Should correctly keep services in n/a state", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:na");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[5]
    ]);
  });

  it("Should correctly keep nothing on unknown states", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:foo");

    const filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([]);
  });

  it("Should be case-insensitive", function() {
    const services = new List({ items: this.mockItems });
    const expr = SearchDSL.parse("is:dElAyED");

    const filters = new DSLFilterList([new ServiceAttributeIsFilter()]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
