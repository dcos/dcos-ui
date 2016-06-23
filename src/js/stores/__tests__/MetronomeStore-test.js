jest.dontMock('../MetronomeStore');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/MetronomeActions');
jest.dontMock('../../structs/Job');
jest.dontMock('../../structs/JobTree');
jest.dontMock('../../../../tests/_fixtures/metronome/jobs.json');
jest.dontMock('../../../../tests/_fixtures/metronome/job.json');

const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../../events/AppDispatcher');
const MetronomeActions = require('../../events/MetronomeActions');
const MetronomeStore = require('../MetronomeStore');
const Config = require('../../config/Config');
const EventTypes = require('../../constants/EventTypes');
const jobsFixture = require('../../../../tests/_fixtures/metronome/jobs.json');
const jobFixture = require('../../../../tests/_fixtures/metronome/job.json');
const JobTree = require('../../structs/JobTree');

describe('MetronomeStore', function () {

  beforeEach(function () {
    // Clean up application timers
    jasmine.clock().uninstall();
    // Install our custom jasmine timers
    jasmine.clock().install();
    MetronomeActions.fetchJobDetail = jasmine.createSpy('fetchJobDetail');
    MetronomeActions.fetchJobs = jasmine.createSpy('fetchJobs');
  });

  afterEach(function () {
    MetronomeStore.removeAllListeners();
    MetronomeStore.stopJobDetailMonitor();
  });

  describe('constructor', function () {

    it('should call the fetchJobs 3 times', function () {
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_CHANGE,
        function () {}
      );
      // Let two intervals run
      jasmine.clock().tick(2 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(MetronomeActions.fetchJobs.calls.count()).toEqual(3);
    });

  });

  describe('dispatcher', function () {

    it('emits event after #fetchJobs success event is dispatched', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOBS_SUCCESS,
        data: jobsFixture
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #fetchJobs error event is dispatched', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOBS_ERROR
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it('emits event after #fetchJobDetail success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_DETAIL_CHANGE,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
          data: jobFixture
        });

        expect(changeHandler).toHaveBeenCalled();
      });

    it('emits event after #fetchJobDetail error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_DETAIL_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_ERROR
        });

        expect(changeHandler).toHaveBeenCalled();
      });

    it('emits event after #deleteJob success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_DELETE_SUCCESS,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_DELETE_SUCCESS,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after #deleteJob error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_DELETE_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_DELETE_ERROR,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after #runJob success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_RUN_SUCCESS,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_RUN_SUCCESS,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after #runJob error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_RUN_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_RUN_ERROR,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after #suspendJob success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_SUSPEND_SUCCESS,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_SUSPEND_SUCCESS,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after #suspendJob error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_SUSPEND_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_SUSPEND_ERROR,
          jobID: 'foo'
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler).toHaveBeenCalledWith('foo');
      });

    it('emits event after create job success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_CREATE_SUCCESS,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_CREATE_SUCCESS,
        });

        expect(changeHandler).toHaveBeenCalled();
      });

    it('emits event after create job error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_CREATE_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_CREATE_ERROR,
          data: {message: 'Json validation error'}
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler)
          .toHaveBeenCalledWith({message: 'Json validation error'});
      });

    it('emits event after update job success event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_UPDATE_SUCCESS,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_UPDATE_SUCCESS,
        });

        expect(changeHandler).toHaveBeenCalled();
      });

    it('emits event after update job error event is dispatched',
      function () {
        let changeHandler = jasmine.createSpy('changeHandler');
        MetronomeStore.addChangeListener(
          EventTypes.METRONOME_JOB_UPDATE_ERROR,
          changeHandler
        );

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_METRONOME_JOB_UPDATE_ERROR,
          data: {message: 'Json validation error'}
        });

        expect(changeHandler).toHaveBeenCalled();
        expect(changeHandler)
          .toHaveBeenCalledWith({message: 'Json validation error'});
      });

  });

  describe('jobTree', function () {

    it('should return an instance of JobTree', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOBS_SUCCESS,
        data: jobsFixture
      });

      let {jobTree} = MetronomeStore;
      expect(jobTree instanceof JobTree).toEqual(true);
    });

  });

  describe('#monitorJobDetail', function () {

    it('should call #fetchJobDetail with jobID in arguments', function () {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail('foo');
      expect(MetronomeActions.fetchJobDetail).toHaveBeenCalledWith('foo');
    });

    it('should continuously poll for job details', function () {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail('foo');
      // Let three intervals run
      jasmine.clock().tick(3 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(4);
    });

    it('should continuously poll for multiple job details', function () {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail('foo');
      MetronomeStore.monitorJobDetail('bar');
      // Let three intervals run
      jasmine.clock().tick(3 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(8);
    });

  });

  describe('#stopJobDetailMonitor', function () {

    it('should prevent subequent fetchJobDetail calls for specific jobID',
      function () {
        // Begin monitoring job details on specific ID
        MetronomeStore.monitorJobDetail('foo');
        // Let three intervals run
        jasmine.clock().tick(3 * Config.getRefreshRate());
        // Finish up outstanding timers
        jest.runOnlyPendingTimers();
        // Stop monitoring specific job's details
        MetronomeStore.stopJobDetailMonitor('foo');
        // Initiate another 1 intervals to ensure the job is no longer fetched
        jasmine.clock().tick(1 * Config.getRefreshRate());
        // Finish up outstanding timers
        jest.runOnlyPendingTimers();
        expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(4);
      });

    it('should prevent subequent fetchJobDetail calls for all jobID',
      function () {
        // Begin monitoring job details on specific IDs
        MetronomeStore.monitorJobDetail('foo');
        MetronomeStore.monitorJobDetail('bar');
        MetronomeStore.monitorJobDetail('baz');
        // Let four intervals run
        jasmine.clock().tick(4 * Config.getRefreshRate());
        // Finish up outstanding timers
        jest.runOnlyPendingTimers();
        // Stop monitoring specific job's details
        MetronomeStore.stopJobDetailMonitor();
        // Initiate another 1 intervals to ensure the jobs are no longer fetched
        jasmine.clock().tick(1 * Config.getRefreshRate());
        // Finish up outstanding timers
        jest.runOnlyPendingTimers();
        expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(15);
      });

  });

  describe('storeID', function () {
    it('should return \'metronome\'', function () {
      expect(MetronomeStore.storeID).toEqual('metronome');
    });
  });

  describe('#suspendSchedule', function () {

    it('should pass the jobID to the action', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      MetronomeActions.suspendSchedule = changeHandler;

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: jobFixture,
        jobID: 'foo'
      });

      MetronomeStore.suspendSchedule('foo');

      expect(changeHandler.calls.allArgs()[0][0]).toEqual('foo');
    });

    it('should grab the schedule and set enabled to false', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      MetronomeActions.suspendSchedule = changeHandler;

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: jobFixture,
        jobID: 'foo'
      });

      MetronomeStore.suspendSchedule('foo');

      expect(changeHandler.calls.allArgs()[0][1].enabled).toEqual(false);
    });

  });

});
