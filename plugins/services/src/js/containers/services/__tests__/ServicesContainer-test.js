jest.dontMock('../ServicesContainer');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const JestUtil = require('../../../../../../../src/js/utils/JestUtil');

const ServicesContainer = require('../ServicesContainer');

describe('ServicesContainer', function () {

  beforeEach(function () {
    this.container = document.createElement('div');
    this.routerStubs = {
      getCurrentPathname() {
        return 'test';
      },
      push: jasmine.createSpy()
    };
    this.wrapper = ReactDOM.render(
      JestUtil.stubRouterContext(ServicesContainer,
        {
          location: { query: {}, pathname: '/test'},
          params: {}
        },
        this.routerStubs
      ),
      this.container
    );
    this.instance = TestUtils.findRenderedComponentWithType(
      this.wrapper,
      ServicesContainer
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#setQueryParams', function () {

    it('updates window location with correct query params', function () {
      this.instance.handleFilterChange('filterOther', [1, 3]);

      expect(this.routerStubs.push.calls.mostRecent().args)
        .toEqual([{pathname: '/test', query: {filterOther: [1, 3]}}]);

      this.instance.handleFilterChange('filterLabels', [
        {key: 'a', value: 'b'},
        {key: 'b', value: 'c'}
      ]);

      expect(this.routerStubs.push.calls.mostRecent().args)
        .toEqual([{pathname: '/test', query: {
          filterLabels: ['a;b', 'b;c'],
          filterOther: [1, 3]
        }}]);
    });

  });

  describe('#getFiltersFromQuery', function () {

    it('decodes filters from Query correctly', function () {
      const filters = this.instance.getFiltersFromQuery({
        filterHealth: ['1', '3'],
        filterStatus: ['10', '11'],
        filterOther: ['20', '21'],
        searchString: 'test',
        filterLabels: ['a;b', 'b;c']
      });

      expect(filters).toEqual({
        filterHealth: [1, 3],
        filterStatus: [10, 11],
        filterOther: [20, 21],
        searchString: 'test',
        filterLabels: [
          {key: 'a', value: 'b'},
          {key: 'b', value: 'c'}
        ]
      });

    });

  });

});
