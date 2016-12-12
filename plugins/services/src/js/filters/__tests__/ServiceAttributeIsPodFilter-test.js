jest.dontMock('../../../../../../src/js/structs/DSLFilterList');
jest.dontMock('../../../../../../src/resources/grammar/SearchDSL.jison');
jest.dontMock('../ServiceAttributeIsPodFilter');
jest.dontMock('../../../../../../src/js/structs/List');

var Application = require('../../structs/Application');
var DSLFilterList = require('../../../../../../src/js/structs/DSLFilterList');
var Framework = require('../../structs/Framework');
var List = require('../../../../../../src/js/structs/List');
var Pod = require('../../structs/Pod');
var SearchDSL = require('../../../../../../src/resources/grammar/SearchDSL.jison');
var ServiceAttributeIsPodFilter = require('../ServiceAttributeIsPodFilter');

describe('ServiceAttributeIsPodFilter', function () {

  beforeEach(function () {
    this.mockItems = [
      new Framework(),
      new Application(),
      new Pod()
    ];
  });

  it('Should match Pod instances', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:pod');

    let filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });

  it('Should correctly keep nothing on unknown values', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:foo');

    let filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
    ]);
  });

  it('Should be case-insensitive', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:pOd');

    let filters = new DSLFilterList().add(new ServiceAttributeIsPodFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[2]
    ]);
  });
});
