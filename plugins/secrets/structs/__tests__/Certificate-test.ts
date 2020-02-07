import Certificate from "../Certificate";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);
const certificateFixture = require("../../../../tests/_fixtures/secrets/certificate.json");

let thisCertificate;

describe("Certificate", () => {
  beforeEach(() => {
    thisCertificate = new Certificate(certificateFixture);
  });

  describe("#name", () => {
    it("returns name", () => {
      expect(thisCertificate.name).toBe("ca.pl");
    });
  });

  describe("#status", () => {
    it("returns status", () => {
      expect(thisCertificate.status).toBe("active");
    });

    it('returns "active" for a "good" status', () => {
      const certificate = new Certificate({ status: "good" });
      expect(certificate.status).toEqual("active");
    });

    it('returns "expired" for a "revoked" status', () => {
      const certificate = new Certificate({ status: "revoked" });
      expect(certificate.status).toEqual("expired");
    });
  });

  describe("#expiresAt", () => {
    it("returns expiresAt", () => {
      const _now = Date.now;
      Date.now = () => new Date("2016-05-20T13:17:00Z").valueOf();

      expect(thisCertificate.expiresAt).toBe("in 1 year");

      Date.now = _now;
    });
  });
});
