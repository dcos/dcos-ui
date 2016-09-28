jest.dontMock('../jobs/JobsTab');
jest.dontMock('../../mixins/InternalStorageMixin');
jest.dontMock('../../mixins/SaveStateMixin');
jest.mock('../../stores/UserSettingsStore');
jest.mock('../../mixins/QueryParamsMixin');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const JestUtil = require('../../utils/JestUtil');

const AlertPanel = require('../../components/AlertPanel');
const MetronomeUtil = require('../../utils/MetronomeUtil');
const DCOSStore = require('foundation-ui').DCOSStore;
const QueryParamsMixin = require('../../mixins/QueryParamsMixin');
const JobsTab = require('../jobs/JobsTab');
const JobTree = require('../../structs/JobTree');
const JobsTable = require('../../pages/jobs/JobsTable');
const UserSettingsStore = require('../../stores/UserSettingsStore');

describe('JobsTab', function () {

  beforeEach(function () {
    DCOSStore.jobTree = new JobTree(MetronomeUtil.parseJobs([{
      id: '/test'
    }]));
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
        TestUtils.scryRenderedComponentsWithType(instance, JobsTable)
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
        TestUtils.scryRenderedComponentsWithType(instance, AlertPanel)
      ).toBeDefined();
    });

  });

});
