import * as ServiceActionModalsUtil from "../ServiceActionModalsUtil";

describe("ServiceActionModalUtil", () => {
  describe("#getActionModalReadableError", () => {
    it("return a readable error it is is error.min", () => {
      expect(
        ServiceActionModalsUtil.getActionModalReadableError(" error.min")
      ).toEqual("Must be bigger than or equal to 0");
    });
    it("returns the same error otherwise", () => {
      expect(
        ServiceActionModalsUtil.getActionModalReadableError(" error.max")
      ).toEqual(" error.max");
    });
  });
});
