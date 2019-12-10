import ApplicationSpec from "../ApplicationSpec";

let thisInstance;

describe("ApplicationSpec", () => {
  describe("#getAcceptedResourceRoles", () => {
    it("returns correct user", () => {
      const service = new ApplicationSpec({
        acceptedResourceRoles: ["public_slave"]
      });

      expect(service.getAcceptedResourceRoles()).toEqual(["public_slave"]);
    });
  });

  describe("#getArguments", () => {
    it("returns array", () => {
      const service = new ApplicationSpec({
        args: []
      });

      expect(Array.isArray(service.getArguments())).toBeTruthy();
    });

    it("returns correct arguments", () => {
      const service = new ApplicationSpec({
        args: [
          "--name 'etcd0'",
          "--advertise-client-urls 'http://192.168.33.10:2379'"
        ]
      });

      expect(service.getArguments()).toEqual([
        "--name 'etcd0'",
        "--advertise-client-urls 'http://192.168.33.10:2379'"
      ]);
    });
  });

  describe("#getCommand", () => {
    it("returns correct command", () => {
      const service = new ApplicationSpec({
        cmd: "sleep 999"
      });

      expect(service.getCommand()).toEqual("sleep 999");
    });
  });

  describe("#getContainerSettings", () => {
    it("returns correct container data", () => {
      const service = new ApplicationSpec({
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "mesosphere/marathon:latest",
            network: "HOST",
            privileged: false,
            parameters: [],
            forcePullImage: false
          }
        }
      });

      expect(service.getContainerSettings()).toEqual({
        type: "DOCKER",
        volumes: [],
        docker: {
          image: "mesosphere/marathon:latest",
          network: "HOST",
          privileged: false,
          parameters: [],
          forcePullImage: false
        }
      });
    });
  });

  describe("#getConstraints", () => {
    beforeEach(() => {
      thisInstance = new ApplicationSpec({
        constraints: [
          ["hostname", "LIKE", "test"],
          ["hostname", "UNLIKE", "no-test"]
        ]
      });
    });

    it("returns array", () => {
      expect(Array.isArray(thisInstance.getConstraints())).toBeTruthy();
    });

    it("returns correct constraints", () => {
      expect(thisInstance.getConstraints()).toEqual([
        ["hostname", "LIKE", "test"],
        ["hostname", "UNLIKE", "no-test"]
      ]);
    });
  });

  describe("#getCpus", () => {
    it("returns the correct cpus", () => {
      const service = new ApplicationSpec({
        cpus: 0.5
      });

      expect(service.getCpus()).toEqual(0.5);
    });
  });

  describe("#getDisk", () => {
    it("returns the correct disk", () => {
      const service = new ApplicationSpec({
        disk: 125
      });

      expect(service.getDisk()).toEqual(125);
    });
  });

  describe("#getEnvironmentVariables", () => {
    it("returns correct command", () => {
      const service = new ApplicationSpec({
        env: { secretName: "test" }
      });

      expect(service.getEnvironmentVariables()).toEqual({ secretName: "test" });
    });
  });

  describe("#getExecutor", () => {
    it("returns correct command", () => {
      const service = new ApplicationSpec({
        executor: "//cmd"
      });

      expect(service.getExecutor()).toEqual("//cmd");
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
            cache: false
          }
        ]
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
          cache: false
        }
      ]);
    });
  });

  describe("#getHealthChecks", () => {
    it("returns correct health check data", () => {
      const service = new ApplicationSpec({
        healthChecks: [{ path: "", protocol: "HTTP" }]
      });

      expect(service.getHealthChecks()).toEqual([
        { path: "", protocol: "HTTP" }
      ]);
    });

    it('returns "cloned" objects, so that no one is accidentally mutating them', () => {
      const service = new ApplicationSpec({
        healthChecks: [{ command: { value: "exit 0;" }, protocol: "COMMAND" }]
      });

      service.getHealthChecks()[0].command = undefined;

      expect(service.getHealthChecks()).toEqual([
        {
          command: { value: "exit 0;" },
          protocol: "COMMAND"
        }
      ]);
    });
  });

  describe("#getInstancesCount", () => {
    it("returns correct instances", () => {
      const service = new ApplicationSpec({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });
  });

  describe("#getIpAddress", () => {
    it("returns the right ipAddress value", () => {
      const service = new ApplicationSpec({
        ipAddress: { networkName: "d-overlay-1" }
      });

      expect(service.getIpAddress()).toEqual({ networkName: "d-overlay-1" });
    });
  });

  describe("#getLabels", () => {
    it("returns correct labels", () => {
      const service = new ApplicationSpec({
        labels: {
          label_1: "1",
          label_2: "2"
        }
      });

      expect(service.getLabels()).toEqual({
        label_1: "1",
        label_2: "2"
      });
    });
  });

  describe("#getMem", () => {
    it("returns the correct mem", () => {
      const service = new ApplicationSpec({
        mem: 49
      });

      expect(service.getMem()).toEqual(49);
    });
  });

  describe("#getPortDefinitions", () => {
    it("returns the correct port definitions", () => {
      const service = new ApplicationSpec({
        portDefinitions: [
          { port: 1234, labels: {}, name: "test", protocol: "tcp" },
          { port: 5678, labels: {}, name: "test", protocol: "udp" }
        ]
      });

      expect(service.getPortDefinitions()).toEqual([
        { port: 1234, labels: {}, name: "test", protocol: "tcp" },
        { port: 5678, labels: {}, name: "test", protocol: "udp" }
      ]);
    });
  });

  describe("#getResidency", () => {
    it("returns the right residency value", () => {
      const service = new ApplicationSpec({
        residency: {
          relaunchEscalationTimeoutSeconds: 10,
          taskLostBehavior: "WAIT_FOREVER"
        }
      });

      expect(service.getResidency()).toEqual({
        relaunchEscalationTimeoutSeconds: 10,
        taskLostBehavior: "WAIT_FOREVER"
      });
    });
  });

  describe("#getResources", () => {
    it("returns correct resource data", () => {
      const service = new ApplicationSpec({
        cpus: 1,
        mem: 2048,
        gpus: 0,
        disk: 0
      });

      expect(service.getResources()).toEqual({
        cpus: 1,
        mem: 2048,
        gpus: 0,
        disk: 0
      });
    });

    it("returns zeros by default", () => {
      const service = new ApplicationSpec({});

      expect(service.getResources()).toEqual({
        cpus: 0,
        mem: 0,
        gpus: 0,
        disk: 0
      });
    });
  });

  describe("#getUpdateStrategy", () => {
    it("returns the right updateStrategy value", () => {
      const service = new ApplicationSpec({
        updateStrategy: {
          maximumOverCapacity: 0,
          minimumHealthCapacity: 0
        }
      });

      expect(service.getUpdateStrategy()).toEqual({
        maximumOverCapacity: 0,
        minimumHealthCapacity: 0
      });
    });
  });

  describe("#getUser", () => {
    it("returns correct user", () => {
      const service = new ApplicationSpec({
        user: "sudo"
      });

      expect(service.getUser()).toEqual("sudo");
    });
  });
});
