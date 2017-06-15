jest.dontMock("../AppDispatcher");
jest.dontMock("../UnitHealthActions");
jest.dontMock("../../config/Config");
jest.dontMock("../../constants/ActionTypes");

const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../AppDispatcher");
const Config = require("../../config/Config");
const MetronomeActions = require("../MetronomeActions");

describe("MetronomeActions", function() {
  describe("#createJob", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.createJob();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v0/scheduled-jobs`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_CREATE_SUCCESS
        );
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_CREATE_ERROR
        );
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchJobs", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.fetchJobs();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(`${Config.metronomeAPI}/v1/jobs`);
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_METRONOME_JOBS_SUCCESS);
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_METRONOME_JOBS_ERROR);
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#fetchJobDetail", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.fetchJobDetail("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v1/jobs/foo`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DETAIL_SUCCESS
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DETAIL_ERROR
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#deleteJob", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.deleteJob("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("fetches data from the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v1/jobs/foo?stopCurrentJobRuns=false`
      );
    });

    it("fetches data with the correct method", function() {
      expect(this.configuration.method).toEqual("DELETE");
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DELETE_SUCCESS
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_DELETE_ERROR
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#updateJob", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.updateJob("foo", { id: "foo", labels: { foo: "bar" } });
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v0/scheduled-jobs/foo`
      );
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_UPDATE_SUCCESS
        );
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_UPDATE_ERROR
        );
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#runJob", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.runJob("foo");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("POSTs data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v1/jobs/foo/runs`
      );
    });

    it("POSTs data with the correct method", function() {
      expect(this.configuration.method).toEqual("POST");
    });

    it("POSTs with the an empty object", function() {
      expect(this.configuration.data).toEqual({});
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_RUN_SUCCESS
        );
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_RUN_ERROR
        );
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#stopJobRun", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.stopJobRun("foo", "foo.1990-01-03t00:00:00z-1");
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("sends data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v1/jobs/foo/runs` +
          "/foo.1990-01-03t00:00:00z-1/actions/stop"
      );
    });

    it("uses the correct method", function() {
      expect(this.configuration.method).toEqual("POST");
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_STOP_RUN_SUCCESS
        );
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_STOP_RUN_ERROR
        );
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });

  describe("#updateSchedule", function() {
    beforeEach(function() {
      spyOn(RequestUtil, "json");
      MetronomeActions.updateSchedule("foo", { id: "bar" });
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it("calls #json from the RequestUtil", function() {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it("PUTs data to the correct URL", function() {
      expect(this.configuration.url).toEqual(
        `${Config.metronomeAPI}/v1/jobs/foo/schedules/bar`
      );
    });

    it("PUTs data with the correct method", function() {
      expect(this.configuration.method).toEqual("PUT");
    });

    it("PUTs data with the correct data", function() {
      expect(this.configuration.data).toEqual({ id: "bar" });
    });

    it("dispatches the correct action when successful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_SUCCESS
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.success([]);
    });

    it("dispatches the correct action when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);

        expect(action.type).toEqual(
          ActionTypes.REQUEST_METRONOME_JOB_SCHEDULE_UPDATE_ERROR
        );
        expect(action.jobID).toEqual("foo");
      });

      this.configuration.error({ message: "error" });
    });

    it("dispatches the xhr when unsuccessful", function() {
      var id = AppDispatcher.register(function(payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: "bar",
          responseJSON: { description: "baz" }
        });
      });

      this.configuration.error({
        foo: "bar",
        responseJSON: { description: "baz" }
      });
    });
  });
});
