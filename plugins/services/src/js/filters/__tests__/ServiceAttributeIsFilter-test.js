jest.dontMock('../../../../../../src/js/structs/DSLFilterList');
jest.dontMock('../../../../../../src/resources/grammar/SearchDSL.jison');
jest.dontMock('../../constants/ServiceStatus');
jest.dontMock('../ServiceAttributeIsFilter');
jest.dontMock('../../../../../../src/js/structs/List');

var DSLFilterList = require('../../../../../../src/js/structs/DSLFilterList');
var SearchDSL = require('../../../../../../src/resources/grammar/SearchDSL.jison');
var ServiceStatus = require('../../constants/ServiceStatus');
var ServiceAttributeIsFilter = require('../ServiceAttributeIsFilter');
var List = require('../../../../../../src/js/structs/List');

describe('ServiceAttributeIsFilter', function () {

  beforeEach(function () {
    this.mockItems = [
      {getServiceStatus() { return ServiceStatus.DELAYED; }},
      {getServiceStatus() { return ServiceStatus.DEPLOYING; }},
      {getServiceStatus() { return ServiceStatus.RUNNING; }},
      {getServiceStatus() { return ServiceStatus.SUSPENDED; }},
      {getServiceStatus() { return ServiceStatus.WAITING; }},
      {getServiceStatus() { return ServiceStatus.NA; }}
    ];
  });

  it('Should correctly keep services in delayed state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:delayed');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it('Should correctly keep services in deploying state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:deploying');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[1]
    ]);
  });

  it('Should correctly keep services in running state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:running');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it('Should correctly keep services in suspended state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:suspended');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[3]
    ]);
  });

  it('Should correctly keep services in waiting state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:waiting');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[4]
    ]);
  });

  it('Should correctly keep services in n/a state', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:na');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[5]
    ]);
  });

  it('Should correctly keep nothing on unknown states', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:foo');

    let filters = new DSLFilterList().add(new ServiceAttributeIsFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
    ]);
  });

  it('Should be case-insensitive', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:dElAyED');

    let filters = new DSLFilterList([
      new ServiceAttributeIsFilter()
    ]);

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

});
