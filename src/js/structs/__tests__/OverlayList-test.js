const Overlay = require("../Overlay");
const OverlayList = require("../OverlayList");

describe("OverlayList", () => {
  describe("#constructor", () => {
    it("creates instances of Overlay", () => {
      const items = [{ foo: "bar" }];

      expect(new OverlayList({ items }).getItems()[0] instanceof Overlay).toBe(
        true
      );
    });
  });
});
