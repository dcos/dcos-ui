import DOMUtils from "../DOMUtils";

let thisStyle, thisPreviousRequest, thisDateNow, thisElement;

describe("DOMUtils", () => {
  describe("#closest", () => {
    it(
      "returns the parent element when provided a selector and " +
        "element where the element is a child of the selection",
      () => {
        const el = {
          parentElement: {
            id: "something-fake",
            matches() {
              return true;
            },
          },
          matches() {
            return false;
          },
        };
        const match = DOMUtils.closest(el, ".fake-selector");

        expect(match.id).toEqual("something-fake");
      }
    );

    it(
      "returns null when provided a selector and element where " +
        "the element is not a child of the selection",
      () => {
        const el = {
          parentElement: null,
          matches() {
            return true;
          },
        };
        const match = DOMUtils.closest(el, ".fake-selector");

        expect(match).toEqual(null);
      }
    );

    it(
      "returns the provided element when the provided element" +
        "matches the selector AND has a parent element",
      () => {
        const el = {
          parentElement: {
            id: "something-fake",
            matches() {
              return false;
            },
          },
          id: "child-element",
          matches() {
            return true;
          },
        };
        const match = DOMUtils.closest(el, ".fake-selector");

        expect(match.id).toEqual("child-element");
      }
    );
  });

  describe("#getComputedWidth", () => {
    function buildElement(style) {
      return `<div style="${style.join(";")}"></div>`;
    }

    beforeEach(() => {
      thisStyle = ["width: 100px"];
    });

    it("calculates left padding", () => {
      thisStyle.push("padding-left: 1px");
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");
      // jsdom doesn't calculate offsetWidth
      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates right padding", () => {
      thisStyle.push("padding-right: 1px");
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates left border", () => {
      thisStyle.push("border-left-width: 1px");
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates right border", () => {
      thisStyle.push("border-right-width: 1px");
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates computed width", () => {
      thisStyle.push(
        "padding-left: 1px",
        "padding-right: 1px",
        "border-left-width: 1px",
        "border-right-width: 1px"
      );
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 104),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("does not calculate unnecessary properties", () => {
      thisStyle.push(
        "padding-top: 1px",
        "padding-bottom: 1px",
        "border-top-width: 1px",
        "border-bottom-width: 1px"
      );
      document.body.innerHTML = buildElement(thisStyle);
      const div = document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 100),
      });

      const width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });
  });

  describe("#scrollTo", () => {
    beforeEach(() => {
      thisPreviousRequest = window.requestAnimationFrame;
      window.requestAnimationFrame = (func) => {
        setTimeout(func, 15);
      };

      thisDateNow = Date.now;
      // Will return 0, 15, 30, 45, 60, etc.
      // adding setTimeout call time each time
      let now = -15;
      Date.now = () => {
        now += 15;

        return now;
      };
    });

    afterEach(() => {
      window.requestAnimationFrame = thisPreviousRequest;
      Date.now = thisDateNow;
    });

    it("doesn't do anything if already scrolled there", () => {
      const container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1000, 500);
      expect(container.scrollTop).toEqual(500);
    });

    it("begins heading towards the target pixel", () => {
      const container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1000, 1000);
      jest.runAllTimers();
      expect(container.scrollTop).toBeGreaterThan(1000);
    });

    it("stops after scrollDuration has passed", () => {
      const container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1500, 1000);
      let callCount = 0;
      window.requestAnimationFrame = (func) => {
        callCount++;
        setTimeout(func, 15);
        // Reset scrollTop to stay in the same spot
        container.scrollTop = 500;
      };
      jest.runAllTimers();
      // We expect the call count to be scrollDuration / timeout call time
      expect(callCount).toEqual(1500 / 15);
    });
  });

  describe("#getDistanceFromTopOfParent", () => {
    beforeEach(() => {
      thisElement = {
        getBoundingClientRect() {
          return {
            top: 300,
          };
        },
        parentNode: {
          getBoundingClientRect() {
            return {
              top: 200,
            };
          },
        },
      };
    });

    it("gets the correct distance from parent top", () => {
      const result = DOMUtils.getDistanceFromTopOfParent(thisElement);

      expect(result).toEqual(100);
    });

    it("returns 0 if there is no parentNode", () => {
      const prevParentNode = thisElement.parentNode;
      thisElement.parentNode = null;

      const result = DOMUtils.getDistanceFromTopOfParent(thisElement);
      expect(result).toEqual(0);

      thisElement.parentNode = prevParentNode;
    });
  });

  describe("#getInputElement", () => {
    function buildElementWithNoInput() {
      document.body.innerHTML = "<div><span>Only text here</span></div>";

      return document.body.querySelector("div");
    }
    function buildElementInput() {
      document.body.innerHTML = "<div><span><input type='text' /></span></div>";

      return document.body.querySelector("div");
    }
    function buildElementTextarea() {
      document.body.innerHTML = "<div><span><textarea></textarea></span></div>";

      return document.body.querySelector("div");
    }
    function buildElementWithTwoTextareas() {
      document.body.innerHTML =
        "<div><span><textarea></textarea><textarea></textarea></span></div>";

      return document.body.querySelector("div");
    }

    const input = buildElementInput();
    const textarea = buildElementTextarea();
    const textareas = buildElementWithTwoTextareas();

    it("returns null if DOM element is without an input/ textarea", () => {
      expect(DOMUtils.getInputElement(buildElementWithNoInput())).toEqual(null);
    });

    it("returns null if empty string is entered", () => {
      expect(DOMUtils.getInputElement("")).toEqual(null);
    });
    it("returns null if a string is entered", () => {
      expect(DOMUtils.getInputElement("asdf")).toEqual(null);
    });
    it("returns null if an array is entered", () => {
      expect(DOMUtils.getInputElement([1, 2, 3])).toEqual(null);
    });
    it("returns null if null entered", () => {
      expect(null).toEqual(null);
    });

    it("returns input element if DOM element is an input", () => {
      const returnValue = DOMUtils.getInputElement(
        input.querySelector("input")
      );
      expect(returnValue.nodeName.toLowerCase()).toEqual("input");
    });
    it("returns textarea element if DOM element is an textarea", () => {
      const returnValue = DOMUtils.getInputElement(
        textarea.querySelector("textarea")
      );
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
    it("returns input element if DOM element has an input", () => {
      const returnValue = DOMUtils.getInputElement(input);
      expect(returnValue.nodeName.toLowerCase()).toEqual("input");
    });
    it("returns textarea element if DOM element has an textarea", () => {
      const returnValue = DOMUtils.getInputElement(textarea);
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
    it("returns textarea element if DOM element has two textareas", () => {
      const returnValue = DOMUtils.getInputElement(textareas);
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
  });
});
