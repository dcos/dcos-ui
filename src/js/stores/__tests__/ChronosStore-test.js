jest.dontMock('../ChronosStore');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/ChronosActions');
jest.dontMock('../../structs/Job');
jest.dontMock('../../structs/JobTree');
jest.dontMock('../../../../tests/_fixtures/chronos/jobs.json');
jest.dontMock('../../../../tests/_fixtures/chronos/job.json');

const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../../events/AppDispatcher');
const ChronosActions = require('../../events/ChronosActions');
const ChronosStore = require('../ChronosStore');
const Config = require('../../config/Config');
const EventTypes = require('../../constants/EventTypes');
const jobsFixture = require('../../../../tests/_fixtures/chronos/jobs.json');
const jobFixture = require('../../../../tests/_fixtures/chronos/job.json');
const JobTree = require('../../structs/JobTree');

describe('ChronosStore', function () {

  beforeEach(function () {
    // Clean up application timers
    jasmine.clock().uninstall();
    // Install our custom jasmine timers
    jasmine.clock().install();
    ChronosActions.fetchJobDetail = jasmine.createSpy('fetchJobDetail');
    ChronosActions.fetchJobs = jasmine.createSpy('fetchJobs');
  });

  afterEach(function () {
    ChronosStore.removeAllListeners();
    ChronosStore.stopJobDetailMonitor();
  });

  describe('constructor', function () {

    it('should call the fetchJobs 3 times', function () {
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_CHANGE,
        function () {}
      );
      // Let two intervals run
      jasmine.clock().tick(2 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobs.calls.count()).toEqual(3);
    });

  });

  describe('dispatcher', function () {

    it('emits event after #fetchJobs success event is dispatched', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOBS_SUCCESS,
        data: jobsFixture
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #fetchJobs error event is dispatched', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOBS_ERROR
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #fetchJobDetail success event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_DETAIL_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_DETAIL_SUCCESS,
        data: jobFixture
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #fetchJobDetail error event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_DETAIL_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_DETAIL_ERROR
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #deleteJob success event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_DELETE_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_DELETE_SUCCESS,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

    it('emits event after #deleteJob error event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_DELETE_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_DELETE_ERROR,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

    it('emits event after #runJob success event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_RUN_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_RUN_SUCCESS,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

    it('emits event after #runJob error event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_RUN_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_RUN_ERROR,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

    it('emits event after #suspendJob success event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_SUSPEND_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_SUSPEND_SUCCESS,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

    it('emits event after #suspendJob error event is dispatched',
      function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOB_SUSPEND_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOB_SUSPEND_ERROR,
        jobID: 'foo'
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith('foo');
    });

  });

  describe('jobTree', function () {

    it('should return an instance of JobTree', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOBS_SUCCESS,
        data: jobsFixture
      });

      let {jobTree} = ChronosStore;
      expect(jobTree instanceof JobTree).toEqual(true);
    });

  });

  describe('#monitorJobDetail', function () {

    it('should call #fetchJobDetail with jobID in arguments', function () {
      // Begin monitoring job details
      ChronosStore.monitorJobDetail('foo');
      expect(ChronosActions.fetchJobDetail).toHaveBeenCalledWith('foo');
    });

    it('should continuously poll for job details', function () {
      // Begin monitoring job details
      ChronosStore.monitorJobDetail('foo');
      // Let three intervals run
      jasmine.clock().tick(3 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobDetail.calls.count()).toEqual(4);
    });

    it('should continuously poll for multiple job details', function () {
      // Begin monitoring job details
      ChronosStore.monitorJobDetail('foo');
      ChronosStore.monitorJobDetail('bar');
      // Let three intervals run
      jasmine.clock().tick(3 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobDetail.calls.count()).toEqual(8);
    });

  });

  describe('#stopJobDetailMonitor', function () {

    it('should prevent subequent fetchJobDetail calls for specific jobID',
      function () {
      // Begin monitoring job details on specific ID
      ChronosStore.monitorJobDetail('foo');
      // Let three intervals run
      jasmine.clock().tick(3 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      // Stop monitoring specific job's details
      ChronosStore.stopJobDetailMonitor('foo');
      // Initiate another 10 intervals to ensure the job is no longer fetched
      jasmine.clock().tick(10 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobDetail.calls.count()).toEqual(4);
    });

    it('should prevent subequent fetchJobDetail calls for all jobID',
      function () {
      // Begin monitoring job details on specific IDs
      ChronosStore.monitorJobDetail('foo');
      ChronosStore.monitorJobDetail('bar');
      ChronosStore.monitorJobDetail('baz');
      // Let four intervals run
      jasmine.clock().tick(4 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      // Stop monitoring specific job's details
      ChronosStore.stopJobDetailMonitor();
      // Initiate another 10 intervals to ensure the jobs are no longer fetched
      jasmine.clock().tick(10 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobDetail.calls.count()).toEqual(15);
    });

  });

  describe('storeID', function () {
    it('should return \'chronos\'', function () {
      expect(ChronosStore.storeID).toEqual('chronos');
    });
  });

});
