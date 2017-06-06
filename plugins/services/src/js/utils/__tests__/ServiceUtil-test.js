jest.dontMock("../ServiceUtil");
jest.dontMock("../../structs/Service");
jest.dontMock("../../constants/VolumeConstants");

const Application = require("../../structs/Application");
const ApplicationSpec = require("../../structs/ApplicationSpec");
const Framework = require("../../structs/Framework");
const Pod = require("../../structs/Pod");
const ServiceUtil = require("../ServiceUtil");

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

  describe("#isSDKService", function() {
    it("should return true if service does not have the proper label", function() {
      const service = new Framework({
        id: "/foo",
        labels: {
          DCOS_COMMONS_API_VERSION: "v1"
        }
      });

      expect(ServiceUtil.isSDKService(service)).toEqual(true);
    });

    it("should return false if service does not have the proper label", function() {
      const service = new Framework({
        id: "/foo",
        labels: {
          FOO_LABEL: "foo value"
        }
      });

      expect(ServiceUtil.isSDKService(service)).toEqual(false);
    });
  });

  describe("#getServiceIDFromTaskID", function() {
    it("returns correct service id for a service in root", function() {
      expect(
        ServiceUtil.getServiceIDFromTaskID(
          "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
        )
      ).toEqual("/test");
    });

    it("returns correct service id for a service in a group", function() {
      expect(
        ServiceUtil.getServiceIDFromTaskID(
          "group_test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
        )
      ).toEqual("/group/test");
    });

    it("returns empty string if id is undefined", function() {
      expect(ServiceUtil.getServiceIDFromTaskID()).toEqual("");
    });
  });
});
