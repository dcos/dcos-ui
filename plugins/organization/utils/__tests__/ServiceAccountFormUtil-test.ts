import * as ServiceAccountFormUtil from "../ServiceAccountFormUtil";

const formData = {
  foo: "bar",
  fooBar: "",
};

describe("ServiceAccountFormUtil", () => {
  describe("#hasErrors", () => {
    it("returns false if errors is not an object", () => {
      expect(ServiceAccountFormUtil.hasErrors("string")).toBe(false);
    });

    it("returns false if errors is not provided", () => {
      expect(ServiceAccountFormUtil.hasErrors()).toBe(false);
    });

    it("returns false if errors is an empty object", () => {
      expect(ServiceAccountFormUtil.hasErrors({})).toBe(false);
    });

    it("returns true if errors is a non-empty object", () => {
      const notEmpty = { foo: "bar" };
      expect(ServiceAccountFormUtil.hasErrors(notEmpty)).toBe(true);
    });
  });

  describe("#requiredFieldPresent", () => {
    it("returns false if formData not provided", () => {
      expect(ServiceAccountFormUtil.requiredFieldPresent("foo")).toBe(false);
    });

    it("returns false if fieldName not provided", () => {
      expect(ServiceAccountFormUtil.requiredFieldPresent()).toBe(false);
    });

    it("returns false if formData[fieldName] is not present", () => {
      expect(ServiceAccountFormUtil.requiredFieldPresent("bar", formData)).toBe(
        false
      );
    });

    it("returns false if formData[fieldName] is an empty string", () => {
      expect(
        ServiceAccountFormUtil.requiredFieldPresent("fooBar", formData)
      ).toBe(false);
    });

    it("returns true if formData[fieldName] is present", () => {
      expect(ServiceAccountFormUtil.requiredFieldPresent("foo", formData)).toBe(
        true
      );
    });
  });

  describe("#getErrors", () => {
    it("returns empty object if errorCode not provided", () => {
      expect(ServiceAccountFormUtil.getErrors()).toEqual({});
    });

    it("returns empty object if errorMsg not provided", () => {
      expect(ServiceAccountFormUtil.getErrors("code")).toEqual({});
    });

    it("returns error message with default matcher if errorCode not in list", () => {
      expect(ServiceAccountFormUtil.getErrors("code", "message")).toEqual({
        uid: "message",
      });
    });

    it("returns error message with correct matcher if errorCode in list", () => {
      expect(
        ServiceAccountFormUtil.getErrors("ERR_INVALID_DATA", "message")
      ).toEqual({ description: "message" });
    });
  });

  describe("#validUid", () => {
    it("returns false for uids > 96 characters", () => {
      expect(
        ServiceAccountFormUtil.validUid(
          "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ"
        )
      ).toBe(false);
    });

    it("returns false for uids containing slashes", () => {
      expect(ServiceAccountFormUtil.validUid("mygroup/myuser")).toBe(false);
    });

    it("returns true for uids containing underscores and dashes", () => {
      expect(ServiceAccountFormUtil.validUid("my_user-example")).toBe(true);
    });
  });

  describe("#validSecretPath", () => {
    it("returns true for paths containing slashes", () => {
      expect(ServiceAccountFormUtil.validSecretPath("mything/mysecret")).toBe(
        true
      );
    });

    it("returns true for paths beginning with a slash", () => {
      expect(ServiceAccountFormUtil.validSecretPath("/mything/mysecret")).toBe(
        true
      );
    });

    it("returns false for secrets containing invalid chars", () => {
      expect(ServiceAccountFormUtil.validSecretPath("mything/my@secret")).toBe(
        false
      );
    });
  });
});
