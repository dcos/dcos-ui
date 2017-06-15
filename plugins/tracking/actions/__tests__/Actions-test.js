jest.dontMock("../Actions");

jest.setMock("react-router", {
  hashHistory: {
    location: "/foo",
    listen() {}
  },
  match() {}
});

const PluginTestUtils = require("PluginTestUtils");

const SDK = PluginTestUtils.getSDK("tracking", { enabled: true });
require("../../SDK").setSDK(SDK);
const Actions = require("../Actions");

PluginTestUtils.dontMock(["Util"]);

global.analytics = {
  initialized: true,
  page() {},
  track() {}
};

var DCOS_METADATA = {
  clusterId: "cluster",
  "dcos-image-commit": "commit",
  "bootstrap-id": "bootstrap"
};

var routes = [{ path: "/foo" }];

describe("Actions", function() {
  Actions.initialize();

  describe("#log", function() {
    beforeEach(function() {
      spyOn(global.analytics, "track");
    });

    afterEach(function() {
      global.analytics.track = function() {};
    });

    it("calls analytics#track", function() {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("foo");
      expect(global.analytics.track.calls.count()).toEqual(1);
    });

    it("calls analytics#track with correct eventID", function() {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("baz");
      expect(global.analytics.track.calls.mostRecent().args[0]).toEqual("baz");
    });

    it("calls analytics#track with correct log", function() {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("foo");

      var args = global.analytics.track.calls.mostRecent().args[1];
      expect(args.appVersion).toBeDefined();
      expect(args.version).toBeDefined();
      expect(args.clusterId).toBeDefined();
      expect(args["dcos-image-commit"]).toBeDefined();
      expect(args["bootstrap-id"]).toBeDefined();
    });
  });

  describe("#setDcosMetadata", function() {
    beforeEach(function() {
      Actions.dcosMetadata = null;
      spyOn(global.analytics, "track");
    });

    it("doesn't track any logs when there's no metadata", function() {
      Actions.log("Test");
      expect(global.analytics.track).not.toHaveBeenCalled();
    });

    it("sets the dcosMetadata", function() {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.dcosMetadata).toEqual(DCOS_METADATA);
    });

    it("runs queued logs when metadata is set", function() {
      Actions.log("foo");
      Actions.log("bar");
      Actions.log("baz");
      spyOn(Actions, "log");
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.log.calls.count()).toEqual(3);
      var calls = Actions.log.calls.all();
      ["foo", "bar", "baz"].forEach(function(log, i) {
        expect(calls[i].args[0]).toEqual(log);
      });
    });
  });

  describe("#setRoutes", function() {
    beforeEach(function() {
      Actions.dcosMetadata = null;
      Actions.routes = null;
      spyOn(global.analytics, "track");
    });

    it("doesn't track any logs when there's no router", function() {
      Actions.log("Test");
      expect(global.analytics.track).not.toHaveBeenCalled();
    });

    it("sets the routes", function() {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.routes).toEqual([{ path: "/foo" }]);
    });

    it("runs queued logs when metadata is set", function() {
      Actions.log("foo");
      Actions.log("bar");
      Actions.log("baz");
      spyOn(Actions, "log");
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.log.calls.count()).toEqual(3);
      var calls = Actions.log.calls.all();
      ["foo", "bar", "baz"].forEach(function(log, i) {
        expect(calls[i].args[0]).toEqual(log);
      });
    });
  });
});
