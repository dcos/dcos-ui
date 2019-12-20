import Overlay from "../Overlay";

let thisOverlay;

describe("Overlay", () => {
  beforeEach(() => {
    thisOverlay = new Overlay({
      info: { name: "foo", prefix: 24, subnet: "192.168.0.0/24" }
    });
  });

  describe("#getPrefix", () => {
    it("returns a value of type number", () => {
      expect(typeof thisOverlay.getPrefix()).toEqual("number");
    });

    it("returns undefined if no info was provided", () => {
      expect(new Overlay({}).getPrefix()).toEqual(undefined);
    });

    it("returns undefined if no options was provided", () => {
      expect(new Overlay().getPrefix()).toEqual(undefined);
    });
  });

  describe("#getName", () => {
    it("returns a value of type string", () => {
      expect(typeof thisOverlay.getName()).toEqual("string");
    });

    it("returns undefined if no info was provided", () => {
      expect(new Overlay({}).getName()).toEqual(undefined);
    });

    it("returns undefined if no options was provided", () => {
      expect(new Overlay().getName()).toEqual(undefined);
    });
  });

  describe("#getSubnet", () => {
    it("returns a value of type string", () => {
      expect(typeof thisOverlay.getSubnet()).toEqual("string");
    });

    it("returns undefined if no info was provided", () => {
      expect(new Overlay({}).getSubnet()).toEqual(undefined);
    });

    it("returns undefined if no options was provided", () => {
      expect(new Overlay().getSubnet()).toEqual(undefined);
    });
  });
});
