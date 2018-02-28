const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const MetronomeActions = require("../../events/MetronomeActions");
const MetronomeStore = require("../MetronomeStore");
const Config = require("../../config/Config");
const EventTypes = require("../../constants/EventTypes");
const jobsFixture = require("../../../../tests/_fixtures/metronome/jobs.json");
const jobFixture = require("../../../../tests/_fixtures/metronome/job.json");
const JobTree = require("../../structs/JobTree");

describe("MetronomeStore", function() {
  beforeEach(function() {
    jest.useFakeTimers();
    // Reset store data
    MetronomeStore.data.jobMap = new Map();
    MetronomeStore.data.jobTree = null;

    MetronomeActions.fetchJobDetail = jasmine.createSpy("fetchJobDetail");
    MetronomeActions.fetchJobs = jasmine.createSpy("fetchJobs");
  });

  afterEach(function() {
    jest.useRealTimers();
    MetronomeStore.removeAllListeners();
    MetronomeStore.stopJobDetailMonitor();
    jest.clearAllTimers();
  });

  describe("constructor", function() {
    it("calls the fetchJobs 3 times", function() {
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_CHANGE,
        function() {}
      );
      // Let two intervals run
      jest.advanceTimersByTime(2 * Config.getRefreshRate());
      expect(MetronomeActions.fetchJobs.calls.count()).toEqual(3);
    });
  });

  describe("dispatcher", function() {
    it("emits event after #fetchJobs success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
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

    it("emits event after #fetchJobs error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOBS_ERROR
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it("emits event after #fetchJobDetail success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
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

    it("emits event after #fetchJobDetail error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_DETAIL_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_ERROR
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it("emits event after #deleteJob success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_DELETE_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DELETE_SUCCESS,
        jobID: "foo"
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo");
    });

    it("emits event after #deleteJob error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_DELETE_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DELETE_ERROR,
        jobID: "foo",
        data: { message: "error" }
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo", { message: "error" });
    });

    it("emits event after #runJob success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_RUN_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_RUN_SUCCESS,
        jobID: "foo"
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo");
    });

    it("emits event after #runJob error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_RUN_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_RUN_ERROR,
        jobID: "foo"
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo");
    });

    it("emits event after update schedule success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS,
        jobID: "foo"
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo");
    });

    it("emits event after update schedule error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR,
        jobID: "foo"
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith("foo");
    });

    it("emits event after create job success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_CREATE_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_CREATE_SUCCESS
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it("emits event after create job error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_CREATE_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_CREATE_ERROR,
        data: { message: "Json validation error" }
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith({
        message: "Json validation error"
      });
    });

    it("emits event after update job success event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_UPDATE_SUCCESS,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_UPDATE_SUCCESS
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    it("emits event after update job error event is dispatched", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOB_UPDATE_ERROR,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_UPDATE_ERROR,
        data: { message: "Json validation error" }
      });

      expect(changeHandler).toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalledWith({
        message: "Json validation error"
      });
    });
  });

  describe("jobTree", function() {
    it("returns an instance of JobTree", function() {
      const changeHandler = jasmine.createSpy("changeHandler");
      MetronomeStore.addChangeListener(
        EventTypes.METRONOME_JOBS_CHANGE,
        changeHandler
      );

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOBS_SUCCESS,
        data: jobsFixture
      });

      const { jobTree } = MetronomeStore;
      expect(jobTree instanceof JobTree).toEqual(true);
    });
  });

  describe("#monitorJobDetail", function() {
    it("calls #fetchJobDetail with jobID in arguments", function() {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail("foo");
      expect(MetronomeActions.fetchJobDetail).toHaveBeenCalledWith("foo");
    });

    it("continuously polls for job details", function() {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail("foo");
      // Let three intervals run
      jest.advanceTimersByTime(3 * Config.getRefreshRate());
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(4);
    });

    it("continuously polls for multiple job details", function() {
      // Begin monitoring job details
      MetronomeStore.monitorJobDetail("foo");
      MetronomeStore.monitorJobDetail("bar");
      // Let three intervals run
      jest.advanceTimersByTime(3 * Config.getRefreshRate());
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(8);
    });
  });

  describe("#stopJobDetailMonitor", function() {
    it("prevents subsequent fetchJobDetail calls for specific jobID", function() {
      // Begin monitoring job details on specific ID
      MetronomeStore.monitorJobDetail("foo");
      // Let three intervals run
      jest.advanceTimersByTime(3 * Config.getRefreshRate());
      // Stop monitoring specific job's details
      MetronomeStore.stopJobDetailMonitor("foo");
      // Initiate another 1 intervals to ensure the job is no longer fetched
      jest.advanceTimersByTime(1 * Config.getRefreshRate());
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(4);
    });

    it("prevents subsequent fetchJobDetail calls for all jobID", function() {
      // Begin monitoring job details on specific IDs
      MetronomeStore.monitorJobDetail("foo");
      MetronomeStore.monitorJobDetail("bar");
      MetronomeStore.monitorJobDetail("baz");
      // Let four intervals run
      jest.advanceTimersByTime(4 * Config.getRefreshRate());
      // Stop monitoring specific job's details
      MetronomeStore.stopJobDetailMonitor();
      // Initiate another 1 intervals to ensure the jobs are no longer fetched
      jest.advanceTimersByTime(1 * Config.getRefreshRate());
      expect(MetronomeActions.fetchJobDetail.calls.count()).toEqual(15);
    });
  });

  describe("storeID", function() {
    it("returns 'metronome'", function() {
      expect(MetronomeStore.storeID).toEqual("metronome");
    });
  });

  describe("#toggleSchedule", function() {
    it("passes the jobID to update schedule", function() {
      spyOn(MetronomeStore, "updateSchedule");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: jobFixture,
        jobID: "foo"
      });

      MetronomeStore.toggleSchedule("foo");

      expect(MetronomeStore.updateSchedule.calls.allArgs()[0][0]).toEqual(
        "foo"
      );
    });

    it("grabs the schedule and set enabled to false", function() {
      spyOn(MetronomeStore, "updateSchedule");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: jobFixture,
        jobID: "foo"
      });

      MetronomeStore.toggleSchedule("foo", false);

      expect(
        MetronomeStore.updateSchedule.calls.allArgs()[0][1].enabled
      ).toEqual(false);
    });

    it("grabs the schedule and set enabled to true by default", function() {
      spyOn(MetronomeStore, "updateSchedule");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: jobFixture,
        jobID: "foo"
      });

      MetronomeStore.toggleSchedule("foo");

      expect(
        MetronomeStore.updateSchedule.calls.allArgs()[0][1].enabled
      ).toEqual(true);
    });

    it("does nothing if job unknown", function() {
      spyOn(MetronomeStore, "updateSchedule");

      MetronomeStore.toggleSchedule("unknown", false);

      expect(MetronomeStore.updateSchedule).not.toHaveBeenCalled();
    });

    it("does nothing if schedule undefined", function() {
      spyOn(MetronomeStore, "updateSchedule");

      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS,
        data: {
          id: "foo"
        },
        jobID: "foo"
      });

      MetronomeStore.toggleSchedule("foo");

      expect(MetronomeStore.updateSchedule).not.toHaveBeenCalled();
    });
  });

  describe("#updateSchedule", function() {
    it("passes the jobID and schedule to the action", function() {
      spyOn(MetronomeActions, "updateSchedule");

      MetronomeStore.updateSchedule("foo", { id: "bar" });

      expect(MetronomeActions.updateSchedule).toHaveBeenCalledWith("foo", {
        id: "bar"
      });
    });
  });
});
