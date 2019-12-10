import Application from "../../structs/Application";
import ApplicationSpec from "../../structs/ApplicationSpec";
import Framework from "../../structs/Framework";
import Pod from "../../structs/Pod";

const ServiceUtil = require("../ServiceUtil");

describe("ServiceUtil", () => {
  describe("#getDefinitionFromSpec", () => {
    it("creates the correct definition for ApplicationSpec", () => {
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

  describe("#isEqual", () => {
    it("returns false if services have different type", () => {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Pod({
        id: "foo"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeFalsy();
    });

    it("returns false if same type but different content", () => {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Application({
        id: "bar"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeFalsy();
    });

    it("returns true if same type and same content", () => {
      const serviceA = new Application({
        id: "foo"
      });
      const serviceB = new Application({
        id: "foo"
      });

      expect(ServiceUtil.isEqual(serviceA, serviceB)).toBeTruthy();
    });
  });

  describe("#isSDKService", () => {
    it("returns true if service does not have the proper label", () => {
      const service = new Framework({
        id: "/foo",
        labels: {
          DCOS_COMMONS_API_VERSION: "v1"
        }
      });

      expect(ServiceUtil.isSDKService(service)).toEqual(true);
    });

    it("returns false if service does not have the proper label", () => {
      const service = new Framework({
        id: "/foo",
        labels: {
          FOO_LABEL: "foo value"
        }
      });

      expect(ServiceUtil.isSDKService(service)).toEqual(false);
    });
  });

  describe("#getServiceIDFromTaskID", () => {
    it("returns correct service id for a service in root", () => {
      expect(
        ServiceUtil.getServiceIDFromTaskID(
          "test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
        )
      ).toEqual("/test");
    });

    it("returns correct service id for a service in a group", () => {
      expect(
        ServiceUtil.getServiceIDFromTaskID(
          "group_test.a1f67e90-1c86-11e6-ae46-0ed0cffa3d76"
        )
      ).toEqual("/group/test");
    });

    it("returns empty string if id is undefined", () => {
      expect(ServiceUtil.getServiceIDFromTaskID()).toEqual("");
    });
  });

  describe("getWebURL", () => {
    it("returns empty string if no labels are provided", () => {
      const labels = {};
      expect(ServiceUtil.getWebURL(labels, "")).toEqual("");
    });
    it("works as expected for all known labels (sdk package with new webui label)", () => {
      const labels = {
        DCOS_SERVICE_NAME: "bar",
        DCOS_SERVICE_PORT_INDEX: "80",
        DCOS_SERVICE_SCHEME: "https",
        DCOS_COMMONS_API_VERSION: "notnull",
        DCOS_SERVICE_WEB_PATH: "/baz"
      };
      expect(ServiceUtil.getWebURL(labels, "foo")).toEqual(
        "foo/service/bar/baz"
      );
    });
    it("returns empty string if service name isn set", () => {
      const labels = {
        DCOS_SERVICE_NAME: "",
        DCOS_SERVICE_PORT_INDEX: "80",
        DCOS_SERVICE_SCHEME: "https",
        DCOS_COMMONS_API_VERSION: "notnull",
        DCOS_SERVICE_WEB_PATH: "/baz"
      };
      expect(ServiceUtil.getWebURL(labels, "foo")).toEqual("");
    });
    it("returns empty string for sdk package not having new label", () => {
      const labels = {
        DCOS_SERVICE_NAME: "bar",
        DCOS_SERVICE_PORT_INDEX: "80",
        DCOS_SERVICE_SCHEME: "https",
        DCOS_COMMONS_API_VERSION: "notnull"
      };
      expect(ServiceUtil.getWebURL(labels, "foo")).toEqual("");
    });
    it("returns url for non-sdk package", () => {
      const labels = {
        DCOS_SERVICE_NAME: "bar",
        DCOS_SERVICE_PORT_INDEX: "80",
        DCOS_SERVICE_SCHEME: "https"
      };
      expect(ServiceUtil.getWebURL(labels, "foo")).toEqual("foo/service/bar/");
    });
    it("returns empty string for non-sdk package lacking label", () => {
      const labels = {
        DCOS_SERVICE_NAME: "bar",
        // DCOS_SERVICE_PORT_INDEX: "80",
        DCOS_SERVICE_SCHEME: "https"
      };
      expect(ServiceUtil.getWebURL(labels, "foo")).toEqual("");
    });
  });
});
