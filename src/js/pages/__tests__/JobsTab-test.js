jest.dontMock('../jobs/JobsTab');
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
var JobsTab = require('../jobs/JobsTab');
var JobTree = require('../../structs/JobTree');
var JobsTable = require('../../pages/jobs/JobsTable');
var UserSettingsStore = require('../../stores/UserSettingsStore');

describe('JobsTab', function () {

  beforeEach(function () {
    DCOSStore.jobTree = new JobTree({
      id: '/',
      apps: [{
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
        JestUtil.stubRouterContext(JobsTab, {params: {id: '/'}}),
        this.container
      );

      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'searchString', ''
      );
    });

    it('are reinstated if stored', function () {
      UserSettingsStore.__setKeyResponse('savedStates', {
        jobsPage: {
          searchString: 'foo'
        }
      });
      ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, {params: {id: '/'}}),
        this.container
      );

      expect(QueryParamsMixin.setQueryParam).toHaveBeenCalledWith(
        'searchString', 'foo'
      );
    });

  });

  describe('#render', function () {

    it('renders the job table', function () {
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, {params: {id: '/'}}),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, JobsTable)
      ).toBeDefined();
    });

    it('renders loading screen', function () {
      DCOSStore.dataProcessed = false;
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, {params: {id: '/'}}),
        this.container
      );

      var node = ReactDOM.findDOMNode(instance);
      expect(
        node.querySelector('.ball-scale')
      ).toBeDefined();
    });

    it('renders correct empty panel', function () {
      DCOSStore.jobTree = new JobTree({id: '/'});
      var instance = ReactDOM.render(
        JestUtil.stubRouterContext(JobsTab, {params: {id: '/'}}),
        this.container
      );

      expect(
        TestUtils.findRenderedComponentWithType(instance, AlertPanel)
      ).toBeDefined();
    });

  });

});
