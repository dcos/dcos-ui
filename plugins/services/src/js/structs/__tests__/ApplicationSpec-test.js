const ApplicationSpec = require("../ApplicationSpec");

describe("ApplicationSpec", function() {
  describe("#getAcceptedResourceRoles", function() {
    it("returns correct user", function() {
      const service = new ApplicationSpec({
        acceptedResourceRoles: ["public_slave"]
      });

      expect(service.getAcceptedResourceRoles()).toEqual(["public_slave"]);
    });
  });

  describe("#getArguments", function() {
    it("returns array", function() {
      const service = new ApplicationSpec({
        args: []
      });

      expect(Array.isArray(service.getArguments())).toBeTruthy();
    });

    it("returns correct arguments", function() {
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

  describe("#getCommand", function() {
    it("returns correct command", function() {
      const service = new ApplicationSpec({
        cmd: "sleep 999"
      });

      expect(service.getCommand()).toEqual("sleep 999");
    });
  });

  describe("#getContainerSettings", function() {
    it("returns correct container data", function() {
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

  describe("#getConstraints", function() {
    beforeEach(function() {
      this.instance = new ApplicationSpec({
        constraints: [
          ["hostname", "LIKE", "test"],
          ["hostname", "UNLIKE", "no-test"]
        ]
      });
    });

    it("returns array", function() {
      expect(Array.isArray(this.instance.getConstraints())).toBeTruthy();
    });

    it("returns correct constraints", function() {
      expect(this.instance.getConstraints()).toEqual([
        ["hostname", "LIKE", "test"],
        ["hostname", "UNLIKE", "no-test"]
      ]);
    });
  });

  describe("#getCpus", function() {
    it("returns the correct cpus", function() {
      const service = new ApplicationSpec({
        cpus: 0.5
      });

      expect(service.getCpus()).toEqual(0.5);
    });
  });

  describe("#getDisk", function() {
    it("returns the correct disk", function() {
      const service = new ApplicationSpec({
        disk: 125
      });

      expect(service.getDisk()).toEqual(125);
    });
  });

  describe("#getEnvironmentVariables", function() {
    it("returns correct command", function() {
      const service = new ApplicationSpec({
        env: { secretName: "test" }
      });

      expect(service.getEnvironmentVariables()).toEqual({ secretName: "test" });
    });
  });

  describe("#getExecutor", function() {
    it("returns correct command", function() {
      const service = new ApplicationSpec({
        executor: "//cmd"
      });

      expect(service.getExecutor()).toEqual("//cmd");
    });
  });

  describe("#getFetch", function() {
    beforeEach(function() {
      this.instance = new ApplicationSpec({
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

    it("returns array", function() {
      expect(Array.isArray(this.instance.getFetch())).toBeTruthy();
    });

    it("returns correct uris", function() {
      expect(this.instance.getFetch()).toEqual([
        {
          uri: "http://resource/uri",
          extract: true,
          executable: false,
          cache: false
        }
      ]);
    });
  });

  describe("#getHealthChecks", function() {
    it("returns correct health check data", function() {
      const service = new ApplicationSpec({
        healthChecks: [{ path: "", protocol: "HTTP" }]
      });

      expect(service.getHealthChecks()).toEqual([
        { path: "", protocol: "HTTP" }
      ]);
    });

    it('returns "cloned" objects, so that no one is accidentally mutating them', function() {
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

  describe("#getInstancesCount", function() {
    it("returns correct instances", function() {
      const service = new ApplicationSpec({
        instances: 1
      });

      expect(service.getInstancesCount()).toEqual(1);
    });
  });

  describe("#getIpAddress", function() {
    it("should return the right ipAddress value", function() {
      const service = new ApplicationSpec({
        ipAddress: { networkName: "d-overlay-1" }
      });

      expect(service.getIpAddress()).toEqual({ networkName: "d-overlay-1" });
    });
  });

  describe("#getLabels", function() {
    it("returns correct labels", function() {
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

  describe("#getMem", function() {
    it("returns the correct mem", function() {
      const service = new ApplicationSpec({
        mem: 49
      });

      expect(service.getMem()).toEqual(49);
    });
  });

  describe("#getPortDefinitions", function() {
    it("returns the correct port definitions", function() {
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

  describe("#getResidency", function() {
    it("should return the right residency value", function() {
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

  describe("#getResources", function() {
    it("returns correct resource data", function() {
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
  });

  describe("#getUpdateStrategy", function() {
    it("should return the right updateStrategy value", function() {
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

  describe("#getUser", function() {
    it("returns correct user", function() {
      const service = new ApplicationSpec({
        user: "sudo"
      });

      expect(service.getUser()).toEqual("sudo");
    });
  });
});
