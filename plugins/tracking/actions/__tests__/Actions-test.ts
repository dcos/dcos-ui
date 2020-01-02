import PluginTestUtils from "PluginTestUtils";

jest.setMock("react-router", {
  hashHistory: {
    location: "/foo",
    listen() {}
  },
  match() {}
});

const SDK = PluginTestUtils.getSDK("tracking", { enabled: true });
require("../../SDK").default.setSDK(SDK);
const Actions = require("../Actions").default;

window.analytics = {
  initialized: true,
  page() {},
  track() {}
};

const DCOS_METADATA = {
  clusterId: "cluster",
  "dcos-image-commit": "commit",
  "bootstrap-id": "bootstrap"
};

const routes = [{ path: "/foo" }];

describe("Actions", () => {
  Actions.initialize();

  describe("#log", () => {
    beforeEach(() => {
      spyOn(window.analytics, "track");
    });

    afterEach(() => {
      window.analytics.track = () => {};
    });

    it("calls analytics#track", () => {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("foo");
      expect(window.analytics.track.calls.count()).toEqual(1);
    });

    it("calls analytics#track with correct eventID", () => {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("baz");
      expect(window.analytics.track.calls.mostRecent().args[0]).toEqual("baz");
    });

    it("calls analytics#track with correct log", () => {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      Actions.log("foo");

      const args = window.analytics.track.calls.mostRecent().args[1];
      expect(args.appVersion).toBeDefined();
      expect(args.version).toBeDefined();
      expect(args.clusterId).toBeDefined();
      expect(args["dcos-image-commit"]).toBeDefined();
      expect(args["bootstrap-id"]).toBeDefined();
    });
  });

  describe("#setDcosMetadata", () => {
    beforeEach(() => {
      Actions.dcosMetadata = null;
      spyOn(window.analytics, "track");
    });

    it("doesn't track any logs when there's no metadata", () => {
      Actions.log("Test");
      expect(window.analytics.track).not.toHaveBeenCalled();
    });

    it("sets the dcosMetadata", () => {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.dcosMetadata).toEqual(DCOS_METADATA);
    });

    it("runs queued logs when metadata is set", () => {
      Actions.log("foo");
      Actions.log("bar");
      Actions.log("baz");
      spyOn(Actions, "log");
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.log.calls.count()).toEqual(3);
      const calls = Actions.log.calls.all();
      ["foo", "bar", "baz"].forEach((log, i) => {
        expect(calls[i].args[0]).toEqual(log);
      });
    });
  });

  describe("#setRoutes", () => {
    beforeEach(() => {
      Actions.dcosMetadata = null;
      Actions.routes = null;
      spyOn(window.analytics, "track");
    });

    it("doesn't track any logs when there's no router", () => {
      Actions.log("Test");
      expect(window.analytics.track).not.toHaveBeenCalled();
    });

    it("sets the routes", () => {
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.routes).toEqual([{ path: "/foo" }]);
    });

    it("runs queued logs when metadata is set", () => {
      Actions.log("foo");
      Actions.log("bar");
      Actions.log("baz");
      spyOn(Actions, "log");
      Actions.setDcosMetadata(DCOS_METADATA);
      Actions.setRoutes(routes);
      expect(Actions.log.calls.count()).toEqual(3);
      const calls = Actions.log.calls.all();
      ["foo", "bar", "baz"].forEach((log, i) => {
        expect(calls[i].args[0]).toEqual(log);
      });
    });
  });
});
