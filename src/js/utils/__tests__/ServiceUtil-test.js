jest.dontMock("../ServiceUtil");

const ServiceUtil = require("../ServiceUtil");

describe("ServiceUtil", function() {
  describe("#isSDKService", function() {
    it("should return true if service does not have the proper label", function() {
      const service = {
        id: "/foo",
        getLabels() {
          return { DCOS_COMMONS_API_VERSION: "v1" };
        }
      };

      expect(ServiceUtil.isSDKService(service)).toEqual(true);
    });

    it("should return false if getLabels is not a function", function() {
      const service = {
        id: "/foo",
        getLabels: "bar"
      };

      expect(ServiceUtil.isSDKService(service)).toEqual(false);
    });

    it("should return false if service does not have the proper label", function() {
      const service = {
        id: "/foo"
      };

      expect(ServiceUtil.isSDKService(service)).toEqual(false);
    });
  });

  describe("#isPackage", function() {
    it("should return true if service does have the proper label", function() {
      const service = {
        id: "/foo",
        getLabels() {
          return { DCOS_PACKAGE_NAME: "FOO" };
        }
      };

      expect(ServiceUtil.isPackage(service)).toEqual(true);
    });

    it("should return false if getLabels is not a function", function() {
      const service = {
        id: "/foo",
        getLabels: "bar"
      };

      expect(ServiceUtil.isPackage(service)).toEqual(false);
    });

    it("should return false if service does not have the proper label", function() {
      const service = {
        id: "/foo"
      };

      expect(ServiceUtil.isPackage(service)).toEqual(false);
    });
  });
});
