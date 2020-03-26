import ApplicationSpec from "../ApplicationSpec";

let thisInstance;

describe("ApplicationSpec", () => {
  describe("#getAcceptedResourceRoles", () => {
    it("returns correct user", () => {
      const service = new ApplicationSpec({
        acceptedResourceRoles: ["public_slave"],
      });

      expect(service.getAcceptedResourceRoles()).toEqual(["public_slave"]);
    });
  });

  describe("#getCommand", () => {
    it("returns correct command", () => {
      const service = new ApplicationSpec({
        cmd: "sleep 999",
      });

      expect(service.getCommand()).toEqual("sleep 999");
    });
  });

  describe("#getConstraints", () => {
    beforeEach(() => {
      thisInstance = new ApplicationSpec({
        constraints: [
          ["hostname", "LIKE", "test"],
          ["hostname", "UNLIKE", "no-test"],
        ],
      });
    });

    it("returns array", () => {
      expect(Array.isArray(thisInstance.getConstraints())).toBeTruthy();
    });

    it("returns correct constraints", () => {
      expect(thisInstance.getConstraints()).toEqual([
        ["hostname", "LIKE", "test"],
        ["hostname", "UNLIKE", "no-test"],
      ]);
    });
  });

  describe("#getCpus", () => {
    it("returns the correct cpus", () => {
      const service = new ApplicationSpec({
        cpus: 0.5,
      });

      expect(service.getCpus()).toEqual(0.5);
    });
  });

  describe("#getDisk", () => {
    it("returns the correct disk", () => {
      const service = new ApplicationSpec({
        disk: 125,
      });

      expect(service.getDisk()).toEqual(125);
    });
  });

  describe("#getFetch", () => {
    beforeEach(() => {
      thisInstance = new ApplicationSpec({
        fetch: [
          {
            uri: "http://resource/uri",
            extract: true,
            executable: false,
            cache: false,
          },
        ],
      });
    });

    it("returns array", () => {
      expect(Array.isArray(thisInstance.getFetch())).toBeTruthy();
    });

    it("returns correct uris", () => {
      expect(thisInstance.getFetch()).toEqual([
        {
          uri: "http://resource/uri",
          extract: true,
          executable: false,
          cache: false,
        },
      ]);
    });
  });

  describe("#getHealthChecks", () => {
    it("returns correct health check data", () => {
      const service = new ApplicationSpec({
        healthChecks: [{ path: "", protocol: "HTTP" }],
      });

      expect(service.getHealthChecks()).toEqual([
        { path: "", protocol: "HTTP" },
      ]);
    });

    it('returns "cloned" objects, so that no one is accidentally mutating them', () => {
      const service = new ApplicationSpec({
        healthChecks: [{ command: { value: "exit 0;" }, protocol: "COMMAND" }],
      });

      service.getHealthChecks()[0].command = undefined;

      expect(service.getHealthChecks()).toEqual([
        {
          command: { value: "exit 0;" },
          protocol: "COMMAND",
        },
      ]);
    });
  });

  describe("#getInstancesCount", () => {
    it("returns correct instances", () => {
      const service = new ApplicationSpec({
        instances: 1,
      });

      expect(service.getInstancesCount()).toEqual(1);
    });
  });

  describe("#getIpAddress", () => {
    it("returns the right ipAddress value", () => {
      const service = new ApplicationSpec({
        ipAddress: { networkName: "d-overlay-1" },
      });

      expect(service.getIpAddress()).toEqual({ networkName: "d-overlay-1" });
    });
  });

  describe("#getLabels", () => {
    it("returns correct labels", () => {
      const service = new ApplicationSpec({
        labels: {
          label_1: "1",
          label_2: "2",
        },
      });

      expect(service.getLabels()).toEqual({
        label_1: "1",
        label_2: "2",
      });
    });
  });

  describe("#getResources", () => {
    it("returns correct resource data", () => {
      const service = new ApplicationSpec({
        cpus: 1,
        mem: 2048,
        gpus: 0,
        disk: 0,
      });

      expect(service.getResources()).toEqual({
        cpus: 1,
        mem: 2048,
        gpus: 0,
        disk: 0,
      });
    });

    it("returns zeros by default", () => {
      const service = new ApplicationSpec({});

      expect(service.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0,
      });
    });
  });
});
