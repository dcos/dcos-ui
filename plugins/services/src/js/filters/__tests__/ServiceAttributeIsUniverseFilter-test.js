jest.dontMock('../../../../../../src/js/structs/DSLFilterList');
jest.dontMock('../../../../../../src/resources/grammar/SearchDSL.jison');
jest.dontMock('../ServiceAttributeIsUniverseFilter');
jest.dontMock('../../../../../../src/js/structs/List');

var Application = require('../../structs/Application');
var DSLFilterList = require('../../../../../../src/js/structs/DSLFilterList');
var Framework = require('../../structs/Framework');
var List = require('../../../../../../src/js/structs/List');
var Pod = require('../../structs/Pod');
var SearchDSL = require('../../../../../../src/resources/grammar/SearchDSL.jison');
var ServiceAttributeIsUniverseFilter = require('../ServiceAttributeIsUniverseFilter');

describe('ServiceAttributeIsUniverseFilter', function () {

  beforeEach(function () {
    this.mockItems = [
      new Framework(),
      new Application(),
      new Pod()
    ];
  });

  it('Should match Framework instances', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:universe');

    let filters = new DSLFilterList().add(new ServiceAttributeIsUniverseFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });

  it('Should correctly keep nothing on unknown values', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:foo');

    let filters = new DSLFilterList().add(new ServiceAttributeIsUniverseFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
    ]);
  });

  it('Should be case-insensitive', function () {
    let services = new List({items: this.mockItems});
    let expr = SearchDSL.parse('is:UniVErSe');

    let filters = new DSLFilterList().add(new ServiceAttributeIsUniverseFilter());

    expect(expr.filter(filters, services).getItems()).toEqual([
      this.mockItems[0]
    ]);
  });
});
