import WindowResizeUtil from "../WindowResizeUtil";

describe("WindowResizeUtil", () => {
  describe("add/remove handlers", () => {
    beforeEach(() => {
      jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb) => cb());
    });

    it("can be triggered globally", () => {
      const testHandler = jest.fn();

      WindowResizeUtil.add(testHandler);
      window.dispatchEvent(new Event("resize"));

      expect(testHandler).toHaveBeenCalled();
      WindowResizeUtil.remove(testHandler);
    });

    it("removes global listener when all listeners are removed", () => {
      const removeSpy = jest.spyOn(window, "removeEventListener");

      const testHandler1 = jest.fn();
      const testHandler2 = jest.fn();

      WindowResizeUtil.add(testHandler1);
      WindowResizeUtil.add(testHandler2);

      WindowResizeUtil.remove(testHandler1);
      expect(removeSpy).not.toHaveBeenCalled();
      WindowResizeUtil.remove(testHandler2);
      expect(removeSpy).toHaveBeenCalled();
    });
  });
});
