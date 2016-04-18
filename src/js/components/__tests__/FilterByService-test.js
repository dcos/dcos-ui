var React = require('react');
var ReactDOM = require('react-dom');

jest.dontMock('../FilterByService');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('./fixtures/MockFrameworks');
jest.dontMock('../../utils/Util');

var FilterByService = require('../FilterByService');
var MockFrameworks = require('./fixtures/MockFrameworks.json');
var ServicesList = require('../../structs/ServicesList');
var Service = require('../../structs/Service');

describe('FilterByService', function () {

  beforeEach(function () {
    this.selectedId = MockFrameworks.frameworks[0].id;

    this.handleByServiceFilterChange = function (id) {
      this.byServiceFilter = id;
    };

    let services = new ServicesList({items: MockFrameworks.frameworks});
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <FilterByService
        byServiceFilter={this.byServiceFilter}
        services={services.getItems()}
        totalHostsCount={10}
        handleFilterChange={this.handleByServiceFilterChange} />,
      this.container
    );
  });
  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should display \'Filter by Service\' as default item', function () {
    var node = ReactDOM.findDOMNode(this.instance);
    var buttonNode = node.querySelector('.dropdown-toggle');

    var badgeNode = ReactDOM.findDOMNode(buttonNode);
    var text = badgeNode.querySelector('.badge-container');

    expect(text.textContent)
      .toEqual('Filter by Service');
  });

  describe('#getItemHtml', function () {

    it('should display the badge correctly', function () {
      let service = new Service(MockFrameworks.frameworks[4]);
      var item = ReactDOM.render(
        this.instance.getItemHtml(service),
        this.container
      );

      var node = ReactDOM.findDOMNode(item);
      var text = node.querySelector('.badge');

      expect(parseInt(text.textContent, 10))
        .toEqual(MockFrameworks.frameworks[4].slave_ids.length);
    });

  });

  describe('#getDropdownItems', function () {

    it('should return all services and the all services item', function () {
      var items = this.instance.getDropdownItems(
        MockFrameworks.frameworks
      );
      expect(items.length)
        .toEqual(MockFrameworks.frameworks.length + 1);
    });

  });

  describe('#getSelectedId', function () {

    it('should return the same number when given a number', function () {
      expect(this.instance.getSelectedId(0)).toEqual(0);
    });

    it('should return the same string when given a string', function () {
      expect(this.instance.getSelectedId('thisIsAnID'))
        .toEqual('thisIsAnID');
    });

    it('should return the default id when given null', function () {
      expect(this.instance.getSelectedId(null)).toEqual('default');
    });

  });

});
