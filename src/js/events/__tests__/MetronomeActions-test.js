import { of, throwError } from "rxjs";

const mockCreateJob = jest.fn();
const mockDeleteJob = jest.fn();
const mockFetchJobDetail = jest.fn();
const mockFetchJobs = jest.fn();
const mockUpdateJob = jest.fn();
const mockRunJob = jest.fn();
const mockStopJobRun = jest.fn();
const mockUpdateSchedule = jest.fn();

jest.mock("../MetronomeClient", () => ({
  createJob: mockCreateJob,
  deleteJob: mockDeleteJob,
  fetchJobDetail: mockFetchJobDetail,
  fetchJobs: mockFetchJobs,
  updateJob: mockUpdateJob,
  runJob: mockRunJob,
  stopJobRun: mockStopJobRun,
  updateSchedule: mockUpdateSchedule
}));

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const MetronomeActions = require("../MetronomeActions");

describe("MetronomeActions", function() {
  describe("#createJob", function() {
    beforeEach(function() {
      jest.clearAllMocks();
    });

    it("calls the createJob", function() {
      mockCreateJob.mockReturnValueOnce(of({}));
      MetronomeActions.createJob({});

      expect(mockCreateJob).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_CREATE_SUCCESS
        );
        done();
      });

      mockCreateJob.mockReturnValueOnce(of({}));

      MetronomeActions.createJob({});
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_CREATE_ERROR
        );
        done();
      });

      mockCreateJob.mockReturnValueOnce(throwError({ message: "error" }));

      MetronomeActions.createJob({});
    });

    it("dispatches the correct error when unsucessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({ message: "error" });
        done();
      });

      mockCreateJob.mockReturnValueOnce(throwError({ message: "error" }));

      MetronomeActions.createJob({});
    });
  });

  describe("#fetchJobs", function() {
    it("calls the createJob", function() {
      mockFetchJobs.mockReturnValueOnce(of([]));
      MetronomeActions.fetchJobs();

      expect(mockFetchJobs).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_METRONOME_JOBS_SUCCESS);
        done();
      });

      mockFetchJobs.mockReturnValueOnce(of([]));
      MetronomeActions.fetchJobs();
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_METRONOME_JOBS_ERROR);
        done();
      });

      mockFetchJobs.mockReturnValueOnce(throwError({ message: "error" }));
      MetronomeActions.fetchJobs();
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockFetchJobs.mockReturnValueOnce(
        throwError({
          foo: "bar",
          responseJSON: { description: "baz" }
        })
      );
      MetronomeActions.fetchJobs();
    });
  });

  describe("#fetchJobDetail", function() {
    it("calls fetchJobDetail", function() {
      mockFetchJobDetail.mockReturnValueOnce(of({}));
      MetronomeActions.fetchJobDetail("my/id");

      expect(mockFetchJobDetail).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS
        );
        expect(action.jobID).toEqual("my/id");
        done();
      });

      mockFetchJobDetail.mockReturnValueOnce(of({}));

      MetronomeActions.fetchJobDetail("my/id");
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DETAIL_ERROR
        );
        expect(action.jobID).toEqual("my/id");
        done();
      });

      mockFetchJobDetail.mockReturnValueOnce(throwError({ message: "error" }));

      MetronomeActions.fetchJobDetail("my/id");
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockFetchJobDetail.mockReturnValueOnce(
        throwError({ foo: "bar", responseJSON: { description: "baz" } })
      );

      MetronomeActions.fetchJobDetail("my/id");
    });
  });

  describe("#deleteJob", function() {
    beforeEach(function() {
      jest.clearAllMocks();
    });

    it("calls the createJob", function() {
      mockDeleteJob.mockReturnValueOnce(of({}));
      MetronomeActions.deleteJob("foo");

      expect(mockDeleteJob).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DELETE_SUCCESS
        );
        done();
      });

      mockDeleteJob.mockReturnValueOnce(of({}));

      MetronomeActions.deleteJob("foo");
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DELETE_ERROR
        );
        done();
      });

      mockDeleteJob.mockReturnValueOnce(throwError({ message: "error" }));

      MetronomeActions.deleteJob("foo");
    });

    it("dispatches the correct error when unsucessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({ message: "error" });
        done();
      });

      mockDeleteJob.mockReturnValueOnce(throwError({ message: "error" }));

      MetronomeActions.deleteJob("foo");
    });
  });

  describe("#updateJob", function() {
    it("calls the updateJob", function() {
      mockUpdateJob.mockReturnValueOnce(of({}));
      MetronomeActions.updateJob({});

      expect(mockUpdateJob).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_UPDATE_SUCCESS
        );
        done();
      });

      mockUpdateJob.mockReturnValueOnce(of({}));
      MetronomeActions.updateJob("foo", {});
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_UPDATE_ERROR
        );
        done();
      });

      mockUpdateJob.mockReturnValueOnce(throwError({ message: "error" }));
      MetronomeActions.updateJob("foo", {});
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockUpdateJob.mockReturnValueOnce(
        throwError({
          foo: "bar",
          responseJSON: { description: "baz" }
        })
      );
      MetronomeActions.updateJob("foo", {});
    });
  });

  describe("#runJob", function() {
    it("calls the runJob", function() {
      mockRunJob.mockReturnValueOnce(of({}));
      MetronomeActions.runJob("foo");

      expect(mockRunJob).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_RUN_SUCCESS
        );
        done();
      });

      mockRunJob.mockReturnValueOnce(of([]));
      MetronomeActions.runJob("foo");
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_RUN_ERROR
        );
        done();
      });

      mockRunJob.mockReturnValueOnce(throwError({ message: "error" }));
      MetronomeActions.runJob("foo");
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockRunJob.mockReturnValueOnce(
        throwError({
          foo: "bar",
          responseJSON: { description: "baz" }
        })
      );
      MetronomeActions.runJob("foo");
    });
  });

  describe("#stopJobRun", function() {
    it("calls the stopJobRun", function() {
      mockStopJobRun.mockReturnValueOnce(of({}));
      MetronomeActions.stopJobRun("foo");

      expect(mockStopJobRun).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS
        );
        done();
      });

      mockStopJobRun.mockReturnValueOnce(of([]));
      MetronomeActions.stopJobRun("foo");
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_STOP_RUN_ERROR
        );
        done();
      });

      mockStopJobRun.mockReturnValueOnce(throwError({ message: "error" }));
      MetronomeActions.stopJobRun("foo");
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockStopJobRun.mockReturnValueOnce(
        throwError({
          foo: "bar",
          responseJSON: { description: "baz" }
        })
      );
      MetronomeActions.stopJobRun("foo");
    });
  });

  describe("#updateSchedule", function() {
    it("calls the updateSchedule", function() {
      mockUpdateSchedule.mockReturnValueOnce(of({}));
      MetronomeActions.updateSchedule("foo", {});

      expect(mockStopJobRun).toHaveBeenCalled();
    });

    it("dispatches the correct action when successful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS
        );
        expect(action.jobID).toEqual("foo");
        done();
      });

      mockUpdateSchedule.mockReturnValueOnce(of({}));
      MetronomeActions.updateSchedule("foo", {});
    });

    it("dispatches the correct action when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR
        );
        expect(action.jobID).toEqual("foo");
        done();
      });

      mockUpdateSchedule.mockReturnValueOnce(throwError({ message: "error" }));
      MetronomeActions.updateSchedule("foo", {});
    });

    it("dispatches the xhr when unsuccessful", function(done) {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
        done();
      });

      mockUpdateSchedule.mockReturnValueOnce(
        throwError({
          foo: "bar",
          responseJSON: { description: "baz" }
        })
      );
      MetronomeActions.updateSchedule("foo", {});
    });
  });
});
