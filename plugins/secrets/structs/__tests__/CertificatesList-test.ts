import Certificate from "../Certificate";
import CertificatesList from "../CertificatesList";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

describe("CertificatesList", () => {
  describe("#constructor", () => {
    it("creates instances of Certificate", () => {
      let items = [{ foo: "bar" }];
      const list = new CertificatesList({ items });
      items = list.getItems();
      expect(items[0] instanceof Certificate).toBeTruthy();
    });
  });
});
