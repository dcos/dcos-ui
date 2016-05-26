jest.dontMock('../ChronosStore');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../events/ChronosActions');
jest.dontMock('../../structs/Job');
jest.dontMock('../../structs/JobTree');
jest.dontMock('../../../../tests/_fixtures/chronos/jobs.json');

import {RequestUtil} from 'mesosphere-shared-reactjs';

const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../../events/AppDispatcher');
const ChronosActions = require('../../events/ChronosActions');
const ChronosStore = require('../ChronosStore');
const Config = require('../../config/Config');
const EventTypes = require('../../constants/EventTypes');
const Job = require('../../structs/Job');
const jobsFixture = require('../../../../tests/_fixtures/chronos/jobs.json');
const JobTree = require('../../structs/JobTree');


describe('ChronosStore', function () {

  beforeEach(function () {
    ChronosActions.fetchJobs = jasmine.createSpy('fetchJobs');
  });

  afterEach(function () {
    ChronosStore.removeAllListeners();
  });

  describe('constructor', function () {

    it('should call the fetchJobs 2 times', function () {
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_CHANGE,
        function () {}
      );
      // Let two intervals run
      jasmine.clock().tick(2 * Config.getRefreshRate());
      // Finish up outstanding timers
      jest.runOnlyPendingTimers();
      expect(ChronosActions.fetchJobs.calls.count()).toEqual(2);
    });

  });

  describe('dispatcher', function () {

    it('emits event after success event is dispatched', function () {
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

    it('emits event after error event is dispatched', function () {
      let changeHandler = jasmine.createSpy('changeHandler');
      ChronosStore.addChangeListener(
        EventTypes.CHRONOS_JOBS_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_CHRONOS_JOBS_ERROR
      });
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

});
