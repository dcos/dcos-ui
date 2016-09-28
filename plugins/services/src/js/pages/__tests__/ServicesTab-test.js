jest.dontMock('../services/ServicesTab');
jest.dontMock('../../structs/ServiceTree');
jest.dontMock('../../../../../../src/js/mixins/InternalStorageMixin');
jest.dontMock('../../../../../../src/js/mixins/SaveStateMixin');
jest.mock('../../../../../../src/js/stores/UserSettingsStore');
jest.mock('../../../../../../src/js/mixins/QueryParamsMixin');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const JestUtil = require('../../../../../../src/js/utils/JestUtil');

const AlertPanel = require('../../../../../../src/js/components/AlertPanel');
const DCOSStore = require('foundation-ui').DCOSStore;
const QueryParamsMixin = require('../../../../../../src/js/mixins/QueryParamsMixin');
const ServicesTab = require('../services/ServicesTab');
const ServiceTree = require('../../structs/ServiceTree');
const ServiceDetail = require('../../components/ServiceDetail');
const ServicesTable = require('../../components/ServicesTable');
const PodDetail = require('../../components/PodDetail');
const UserSettingsStore = require('../../../../../../src/js/stores/UserSettingsStore');

describe('ServicesTab', function () {

  beforeEach(function () {
    DCOSStore.serviceTree = new ServiceTree({
      id: '/',
      items: [{
        id: '/alpha',
        instances: 1
      }, {
        id: '/pod',
        instances: 1,
        spec: {
          containers: []
        }
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
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}, {
          getCurrentRoutes() {
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
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}, {
          getCurrentRoutes() {
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

    it('renders the pod detail view when passed a pod', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/pod'}}, {
          getCurrentRoutes() {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, PodDetail)
      ).toBeDefined();
    });

    it('renders the service table', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}, {
          getCurrentRoutes() {
            return [{name: 'services-task-details-tab'}];
          }
        }),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, ServicesTable)
      ).toBeDefined();
    });

    it('renders empty service table', function () {
      DCOSStore.serviceTree = new ServiceTree({
        id: '/',
        items: [{
          id: '/gg',
          items: []
        }]
      });
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/gg'}}, {
          getCurrentRoutes() {
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
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/alpha'}}, {
          getCurrentRoutes() {
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
        JestUtil.stubRouterContext(ServicesTab, {params: {id: '/'}}, {
          getCurrentRoutes() {
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
        JestUtil.stubRouterContext(ServicesTab, {params: {}}, {
          getCurrentRoutes() {
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
