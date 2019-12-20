import Application from "../../structs/Application";
import Framework from "../../structs/Framework";
import * as Version from "../../utils/Version";

describe("Version", () => {
  describe("#fromService", () => {
    it("get's a raw version", () => {
      expect(
        Version.fromService(
          new Framework({ labels: { DCOS_PACKAGE_VERSION: "2.3.0-1.1.0" } })
        )
      ).toEqual("2.3.0-1.1.0");

      expect(
        Version.fromService(
          new Application({ version: "2018-09-13T21:42:41.611Z" })
        )
      ).toEqual("2018-09-13T21:42:41.611Z");
    });
  });
});
