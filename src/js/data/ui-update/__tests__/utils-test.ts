import { parseVersion } from "../utils";

describe("utils", () => {
  describe("parseVersion", () => {
    it("handles master build", () => {
      expect(parseVersion("master+v2.1.0")).toEqual("v2.1.0");
    });

    it("handles master build with hash", () => {
      expect(parseVersion("master+v2.1.0+abcdefg")).toEqual("v2.1.0");
    });

    it("handles local dev build", () => {
      expect(parseVersion("0.0.0-dev+semantic-release")).toEqual("0.0.0");
    });

    it("handles release branch build", () => {
      expect(parseVersion("1.13+v2.1.0")).toEqual("v2.1.0");
    });

    it("returns provided version if format not received", () => {
      expect(parseVersion("not_in_expected_format")).toEqual(
        "not_in_expected_format"
      );
    });
  });
});
