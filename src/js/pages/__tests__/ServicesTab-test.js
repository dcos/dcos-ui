jest.dontMock('../services/ServicesTab');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../mixins/SaveStateMixin');
jest.mock('../../stores/UserSettingsStore');
jest.mock('../../mixins/QueryParamsMixin');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var JestUtil = require('../../utils/JestUtil');

var AlertPanel = require('../../components/AlertPanel');
var DCOSStore = require('../../stores/DCOSStore');
var QueryParamsMixin = require('../../mixins/QueryParamsMixin');
var ServicesTab = require('../services/ServicesTab');
var ServiceTree = require('../../structs/ServiceTree');
var ServiceDetail = require('../../components/ServiceDetail');
var ServicesTable = require('../../components/ServicesTable');
var UserSettingsStore = require('../../stores/UserSettingsStore');

describe('ServicesTab', function () {

  beforeEach(function () {
    DCOSStore.serviceTree = new ServiceTree({
      id: '/',
      items: [{
        id: '/alpha'
      }]
    });
    DCOSStore.dataProcessed = true;
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('Query parameters', function () {

    afterEach(UserSettingsStore.__reset);

    it('are set to the default values if not stored', function () {
      ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );
      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'filterHealth', null
      );
      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'searchString', ''
      );
    });

    it('are reinstated if stored', function () {
      UserSettingsStore.__setKeyResponse('savedStates', {
        servicesPage: {
          filterHealth: ['0'],
          searchString: 'foo'
        }
      });
      ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );
      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'filterHealth', ['0']
      );
      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'searchString', 'foo'
      );
    });

  });

  describe('#render', function () {

    it('renders the service table', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, ServicesTable)
      ).toBeDefined();
    });

    it('renders the service detail', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/alpha'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, ServiceDetail)
      ).toBeDefined();
    });

    it('renders loading screen', function () {
      DCOSStore.dataProcessed = false;
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      var node = ReactDOM.findDOMNode(instance);
      expect(
        node.querySelector('.ball-scale')
      ).toBeDefined();
    });

    it('renders correct empty panel', function () {
      DCOSStore.serviceTree = new ServiceTree({id: '/'});
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}},
        {
          getCurrentRoutes: function () {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, AlertPanel)
      ).toBeDefined();
    });

  });

});
