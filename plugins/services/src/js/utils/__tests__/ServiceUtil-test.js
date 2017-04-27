jest.dontMock("../ServiceUtil");
jest.dontMock("../../structs/Service");
jest.dontMock("../../schemas/ServiceSchema");
jest.dontMock("../../constants/VolumeConstants");

const Application = require("../../structs/Application");
const ApplicationSpec = require("../../structs/ApplicationSpec");
const Framework = require("../../structs/Framework");
const Pod = require("../../structs/Pod");
const ServiceUtil = require("../ServiceUtil");
const ServiceSchema = require("../../schemas/ServiceSchema");

describe("ServiceUtil", function() {
  describe("#createServiceFromResponse", function() {
    it("should correctly create Application instances", function() {
      const instance = ServiceUtil.createServiceFromResponse({
        id: "/test",
        cmd: "sleep 1000;",
        cpus: null,
        mem: null,
        disk: null,
        instances: null
      });

      expect(instance instanceof Application).toBeTruthy();
    });

    it("should correctly create Framework instances", function() {
      const instance = ServiceUtil.createServiceFromResponse({
        id: "/test",
        cmd: "sleep 1000;",
        cpus: null,
        mem: null,
        disk: null,
        instances: null,
        labels: {
          DCOS_PACKAGE_FRAMEWORK_NAME: "Test Framework"
        }
      });

      expect(instance instanceof Framework).toBeTruthy();
    });

    it("should correctly create Pod instances", function() {
      const instance = ServiceUtil.createServiceFromResponse({
        id: "/test",
        spec: {
          containers: []
        },
        instances: []
      });

      expect(instance instanceof Pod).toBeTruthy();
    });
  });

  describe("#createSpecFromFormModel", function() {
    it("should convert to the correct Service", function() {
      const model = {
        general: {
          id: "/test",
          cmd: "sleep 1000;"
        }
      };

      const expectedService = new ApplicationSpec({
        id: "/test",
        cmd: "sleep 1000;",
        cpus: null,
        mem: null,
        disk: null,
        instances: null
      });

      expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
        expectedService
      );
    });

    it("should return empty service if null is provided", function() {
      const model = null;

      const expectedService = new ApplicationSpec({});

      expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
        expectedService
      );
    });

    it("should return empty service if empty object is provided", function() {
      const model = {};

      const expectedService = new ApplicationSpec({});

      expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
        expectedService
      );
    });

    describe("environmentVariables", function() {
      it('should keep undefined values as ""', function() {
        const service = ServiceUtil.createSpecFromFormModel({
          environmentVariables: {
            environmentVariables: [
              { key: "a", value: "correct" },
              { key: "b", value: undefined }
            ]
          }
        });
        expect(service.env).toEqual({
          A: "correct",
          B: ""
        });
      });

      it("should not set items with no key", function() {
        const service = ServiceUtil.createSpecFromFormModel({
          environmentVariables: {
            environmentVariables: [
              { key: "a", value: "correct" },
              { value: undefined }
            ]
          }
        });
        expect(service.env).toEqual({
          A: "correct"
        });
      });

      it('should keep null values as ""', function() {
        const service = ServiceUtil.createSpecFromFormModel({
          environmentVariables: {
            environmentVariables: [
              { key: "A", value: "correct" },
              { key: "B", value: null }
            ]
          }
        });
        expect(service.env).toEqual({
          A: "correct",
          B: ""
        });
      });
    });

    describe("labels", function() {
      it('should keep undefined values as ""', function() {
        const service = ServiceUtil.createSpecFromFormModel({
          labels: {
            labels: [
              { key: "a", value: "correct" },
              { key: "b", value: undefined }
            ]
          }
        });
        expect(service.labels).toEqual({
          a: "correct",
          b: ""
        });
      });

      it("should not set items with no key", function() {
        const service = ServiceUtil.createSpecFromFormModel({
          labels: {
            labels: [{ key: "a", value: "correct" }, { value: undefined }]
          }
        });
        expect(service.labels).toEqual({
          a: "correct"
        });
      });

      it('should keep null values as ""', function() {
        const service = ServiceUtil.createSpecFromFormModel({
          labels: {
            labels: [{ key: "a", value: "correct" }, { key: "b", value: null }]
          }
        });
        expect(service.labels).toEqual({
          a: "correct",
          b: ""
        });
      });
    });

    describe("networking", function() {
      describe("host mode", function() {
        it("should not add a portDefinitions field if no ports were passed in", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: []
            }
          });
          expect(service.portDefinitions).not.toBeDefined();
        });

        it("should convert the supplied network fields", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{ protocol: "udp", name: "foo" }]
            }
          });
          expect(service.portDefinitions).toEqual([
            { port: 0, protocol: "udp", name: "foo" }
          ]);
        });

        it("should enforce the port when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{ lbPort: 1234, loadBalanced: true }]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(1234);
        });

        it("should not override the port to 0 when loadBalanced is off", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{ lbPort: 1234, loadBalanced: false }]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(1234);
        });

        it("should default the port to 0 when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{ loadBalanced: true }]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(0);
        });

        it("should add a VIP label when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            general: { id: "/foo/bar" },
            networking: {
              networkType: "host",
              ports: [{ lbPort: 1234, loadBalanced: true }]
            }
          });
          expect(service.portDefinitions[0].labels).toEqual({
            VIP_0: "/foo/bar:1234"
          });
        });

        it("increments the VIP index", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            general: { id: "/foo/bar" },
            networking: {
              networkType: "host",
              ports: [
                { lbPort: 1234, loadBalanced: true },
                { lbPort: 4321, loadBalanced: true }
              ]
            }
          });
          expect(service.portDefinitions[1].labels).toEqual({
            VIP_1: "/foo/bar:4321"
          });
        });

        it("should not add any port definitions if ports is empty", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{}]
            }
          });
          expect(service.portDefinitions).not.toBeDefined();
        });
      });

      describe("host mode (with docker)", function() {
        beforeEach(function() {
          this.service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "host",
              ports: [{ lbPort: 1234 }]
            }
          });
        });

        it("should add a portDefinitions field", function() {
          expect(this.service.portDefinitions).toBeDefined();
        });

        it("should not add a portMappings field to the docker definition", function() {
          expect(this.service.container.docker.portMappings).not.toBeDefined();
        });

        it("sets the docker network property correctly", function() {
          expect(this.service.container.docker.network).toEqual("HOST");
        });
      });

      describe("bridge mode (with docker)", function() {
        beforeEach(function() {
          this.serviceEmptyPorts = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "bridge",
              ports: [{ lbPort: 1234 }]
            }
          });
        });

        it("should not add a portMappings field if no ports were passed in", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: { networkType: "bridge" }
          });
          expect(Object.keys(service.container.docker)).not.toContain(
            "portMappings"
          );
        });

        it("should not add a portDefinitions field to the app config", function() {
          expect(Object.keys(this.serviceEmptyPorts)).not.toContain(
            "portDefinitions"
          );
        });

        it("should convert the supplied string fields", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "bridge",
              ports: [{ protocol: "udp", name: "foo" }]
            }
          });
          expect(service.container.docker.portMappings).toEqual([
            { containerPort: 0, protocol: "udp", name: "foo" }
          ]);
        });

        it("should add the specified containerPort", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "bridge",
              ports: [{ lbPort: 1234 }]
            }
          });
          expect(
            service.container.docker.portMappings[0].containerPort
          ).toEqual(1234);
        });

        it("should not remove host port", function() {
          const definition = {
            container: {
              docker: {
                image: "docker/image",
                portMappings: [
                  {
                    containerPort: 514,
                    servicePort: 10000,
                    hostPort: 5514
                  }
                ],
                network: "BRIDGE"
              }
            }
          };

          const model = {
            containerSettings: {
              forcePullImage: true,
              image: "docker/image",
              parameters: null,
              privileged: undefined
            },
            networking: {
              networkType: "bridge",
              ports: [
                {
                  expose: true,
                  lbPort: 514,
                  hostPort: 5514,
                  loadBalanced: undefined,
                  name: undefined,
                  protocol: undefined
                }
              ]
            }
          };

          const spec = ServiceUtil.createSpecFromFormModel(
            model,
            ServiceSchema,
            false,
            definition
          );

          expect(
            spec.getContainerSettings().docker.portMappings[0].hostPort
          ).toEqual(5514);
        });

        it("should not remove service port", function() {
          const definition = {
            container: {
              docker: {
                image: "docker/image",
                portMappings: [
                  {
                    containerPort: 514,
                    servicePort: 10000,
                    hostPort: 5514
                  }
                ],
                network: "BRIDGE"
              }
            }
          };

          const model = {
            containerSettings: {
              forcePullImage: true,
              image: "docker/image",
              parameters: null,
              privileged: undefined
            },
            networking: {
              networkType: "bridge",
              ports: [
                {
                  expose: true,
                  lbPort: 514,
                  hostPort: 5514,
                  servicePort: 10000,
                  loadBalanced: undefined,
                  name: undefined,
                  protocol: undefined
                }
              ]
            }
          };

          const spec = ServiceUtil.createSpecFromFormModel(
            model,
            ServiceSchema,
            false,
            definition
          );

          expect(
            spec.getContainerSettings().docker.portMappings[0].servicePort
          ).toEqual(10000);
        });

        it("should add a VIP label when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            general: { id: "/foo/bar" },
            containerSettings: { image: "redis" },
            networking: {
              networkType: "bridge",
              ports: [{ lbPort: 1234, loadBalanced: true }]
            }
          });
          expect(service.container.docker.portMappings[0].labels).toEqual({
            VIP_0: "/foo/bar:1234"
          });
        });

        it("sets the docker network property correctly", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: { networkType: "bridge" }
          });
          expect(service.container.docker.network).toEqual("BRIDGE");
        });

        it("should not add any port definitions if ports is empty", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            networking: {
              networkType: "host",
              ports: [{}]
            }
          });
          expect(service.portDefinitions).not.toBeDefined();
        });
      });

      describe("user mode", function() {
        it("sets the docker network property correctly", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: { networkType: "prod" }
          });
          expect(service.container.docker.network).toEqual("USER");
        });

        it("adds the networkName field to the service", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: { networkType: "prod", ports: [{}] }
          });
          expect(service.ipAddress.networkName).toEqual("prod");
        });

        it("should convert the supplied string fields", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ protocol: "udp", name: "foo" }]
            }
          });
          expect(service.container.docker.portMappings).toEqual([
            { containerPort: 0, protocol: "udp", name: "foo" }
          ]);
        });

        it("should add the specified containerPort", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234 }]
            }
          });
          expect(
            service.container.docker.portMappings[0].containerPort
          ).toEqual(1234);
        });

        it("should not add a servicePort when loadBalanced is off", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234 }]
            }
          });
          expect(
            Object.keys(service.container.docker.portMappings[0])
          ).not.toContain("servicePort");
        });

        it("should not overwrite service port", function() {
          const model = {
            containerSettings: {
              forcePullImage: true,
              image: "docker/image",
              parameters: null,
              privileged: undefined
            },
            networking: {
              networkType: "user",
              ports: [
                {
                  expose: true,
                  lbPort: 514,
                  servicePort: 5514,
                  loadBalanced: true
                }
              ]
            }
          };

          const service = ServiceUtil.createSpecFromFormModel(model);

          expect(
            service.getContainerSettings().docker.portMappings[0].servicePort
          ).toEqual(5514);
        });

        it("should not add a hostPort when loadBalanced is off", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234 }]
            }
          });
          expect(
            Object.keys(service.container.docker.portMappings[0])
          ).not.toContain("hostPort");
        });

        it("should not overwrite host port", function() {
          const model = {
            containerSettings: {
              forcePullImage: true,
              image: "docker/image",
              parameters: null,
              privileged: undefined
            },
            networking: {
              networkType: "user",
              ports: [
                {
                  expose: true,
                  lbPort: 514,
                  hostPort: 5514,
                  loadBalanced: true
                }
              ]
            }
          };

          const service = ServiceUtil.createSpecFromFormModel(model);

          expect(
            service.getContainerSettings().docker.portMappings[0].hostPort
          ).toEqual(5514);
        });

        it("should default host port to `0` (zero)", function() {
          const model = {
            containerSettings: {
              forcePullImage: true,
              image: "docker/image",
              parameters: null,
              privileged: undefined
            },
            networking: {
              networkType: "user",
              ports: [
                {
                  expose: true,
                  lbPort: 514,
                  hostPort: undefined,
                  loadBalanced: true
                }
              ]
            }
          };

          const service = ServiceUtil.createSpecFromFormModel(model);

          expect(
            service.getContainerSettings().docker.portMappings[0].hostPort
          ).toEqual(0);
        });

        it("should add a servicePort when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234, loadBalanced: true }]
            }
          });
          expect(service.container.docker.portMappings[0].servicePort).toEqual(
            1234
          );
        });

        it("should not add a VIP label when loadBalanced is off", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234 }]
            }
          });
          expect(
            Object.keys(service.container.docker.portMappings[0])
          ).not.toContain("labels");
        });

        it("should add the appropriate VIP label when loadBalanced is on", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            general: { id: "/foo/bar" },
            networking: {
              networkType: "user",
              ports: [{ lbPort: 1234, loadBalanced: true }]
            }
          });
          expect(service.container.docker.portMappings[0].labels).toEqual({
            VIP_0: "/foo/bar:1234"
          });
        });

        it("should not add any port definitions if ports is empty", function() {
          const service = ServiceUtil.createSpecFromFormModel({
            containerSettings: { image: "redis" },
            networking: {
              networkType: "user",
              ports: [{}]
            }
          });
          expect(service.portDefinitions).not.toBeDefined();
        });
      });
    });

    describe("should return a service with", function() {
      it("local Volumes", function() {
        const model = {
          volumes: {
            localVolumes: [
              {
                containerPath: "home",
                size: 10
              }
            ]
          }
        };

        const expectedService = new ApplicationSpec({
          container: {
            type: "MESOS",
            volumes: [
              {
                containerPath: "home",
                persistent: {
                  size: 10
                },
                mode: "RW"
              }
            ]
          },
          updateStrategy: { maximumOverCapacity: 0, minimumHealthCapacity: 0 },
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: "WAIT_FOREVER"
          }
        });

        expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
          expectedService
        );
      });

      it("local and docker Volumes", function() {
        const model = {
          containerSettings: {
            image: "nginx"
          },
          volumes: {
            localVolumes: [
              {
                containerPath: "home",
                size: 10
              }
            ],
            dockerVolumes: [
              {
                containerPath: "home",
                hostPath: "home",
                mode: "rw"
              }
            ]
          }
        };

        const expectedService = new ApplicationSpec({
          container: {
            type: "DOCKER",
            docker: {
              image: "nginx"
            },
            volumes: [
              {
                containerPath: "home",
                hostPath: "home",
                mode: "RW"
              },
              {
                containerPath: "home",
                persistent: {
                  size: 10
                },
                mode: "RW"
              }
            ]
          },
          updateStrategy: { maximumOverCapacity: 0, minimumHealthCapacity: 0 },
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: "WAIT_FOREVER"
          }
        });

        expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
          expectedService
        );
      });

      it("docker Volumes", function() {
        const model = {
          containerSettings: {
            image: "nginx"
          },
          volumes: {
            dockerVolumes: [
              {
                containerPath: "home",
                hostPath: "home",
                mode: "rw"
              }
            ]
          }
        };

        const expectedService = new ApplicationSpec({
          container: {
            type: "DOCKER",
            docker: {
              image: "nginx"
            },
            volumes: [
              {
                containerPath: "home",
                hostPath: "home",
                mode: "RW"
              }
            ]
          }
        });

        expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
          expectedService
        );
      });

      it("external Volumes", function() {
        const model = {
          volumes: {
            externalVolumes: [
              {
                containerPath: "home",
                externalName: "home"
              }
            ]
          }
        };

        const expectedService = new ApplicationSpec({
          container: {
            type: "MESOS",
            volumes: [
              {
                containerPath: "home",
                external: {
                  name: "home",
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray"
                  }
                },
                mode: "RW"
              }
            ]
          },
          updateStrategy: { maximumOverCapacity: 0, minimumHealthCapacity: 0 }
        });

        expect(ServiceUtil.createSpecFromFormModel(model)).toEqual(
          expectedService
        );
      });
    });

    describe("container settings", function() {
      beforeEach(function() {
        this.service = ServiceUtil.createSpecFromFormModel({
          containerSettings: {
            image: "redis",
            parameters: [{ key: "key-a", value: "value-a" }]
          }
        });
      });

      it("should correctly parse docker parameters", function() {
        expect(this.service.container.docker.parameters).toBeDefined();
      });

      it("should convert parameters to an array of objects", function() {
        expect(this.service.container.docker.parameters[0].key).toEqual(
          "key-a"
        );
        expect(this.service.container.docker.parameters[0].value).toEqual(
          "value-a"
        );
      });
    });
  });

  describe("#createFormModelFromSchema", function() {
    it("should create the correct model", function() {
      const schema = {
        type: "object",
        properties: {
          General: {
            description: "Configure your container",
            type: "object",
            properties: {
              id: {
                default: "/service",
                title: "ID",
                description: "The id for the service",
                type: "string",
                getter(service) {
                  return service.getId();
                }
              },
              cmd: {
                title: "Command",
                default: "sleep 1000;",
                description: "The command which is executed by the service",
                type: "string",
                multiLine: true,
                getter(service) {
                  return service.getSpec().getCommand();
                }
              }
            }
          }
        },
        required: ["General"]
      };

      const service = new Application({
        id: "/test",
        cmd: "sleep 1000;"
      });

      expect(ServiceUtil.createFormModelFromSchema(schema, service)).toEqual({
        General: {
          id: "/test",
          cmd: "sleep 1000;"
        }
      });
    });
  });

  describe("#getDefinitionFromSpec", function() {
    it("should create the correct definition for ApplicationSpec", function() {
      const service = new ApplicationSpec({
        id: "/test",
        cmd: "sleep 1000;"
      });

      expect(ServiceUtil.getDefinitionFromSpec(service)).toEqual({
        id: "/test",
        cmd: "sleep 1000;"
      });
    });
  });

  describe("#convertServiceLabelsToArray", function() {
    it("should return an array of key-value tuples", function() {
      const service = new Application({
        id: "/test",
        cmd: "sleep 1000;",
        labels: {
          label_one: "value_one",
          label_two: "value_two"
        }
      });

      const serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(2);
      expect(serviceLabels).toEqual([
        { key: "label_one", value: "value_one" },
        { key: "label_two", value: "value_two" }
      ]);
    });

    it("should return an empty array if no labels are found", function() {
      const service = new Application({
        id: "/test",
        cmd: "sleep 1000;"
      });

      const serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(0);
      expect(serviceLabels).toEqual([]);
    });

    it("only performs the conversion on a Service", function() {
      const service = {};
      const serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(0);
      expect(serviceLabels).toEqual([]);
    });
  });

  describe("#isEqual", function() {
    it("should return false if services have different type", function() {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Pod({
        id: "foo"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeFalsy();
    });

    it("should return false if same type but different content", function() {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Application({
        id: "bar"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeFalsy();
    });

    it("should return true if same type and same content", function() {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Application({
        id: "foo"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeTruthy();
    });
  });
});
