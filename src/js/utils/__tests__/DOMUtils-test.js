const DOMUtils = require("../DOMUtils");

describe("DOMUtils", function() {
  describe("#closest", function() {
    it(
      "returns the parent element when provided a selector and " +
        "element where the element is a child of the selection",
      function() {
        var el = {
          parentElement: {
            id: "something-fake",
            matches() {
              return true;
            }
          },
          matches() {
            return false;
          }
        };
        var match = DOMUtils.closest(el, ".fake-selector");

        expect(match.id).toEqual("something-fake");
      }
    );

    it(
      "returns null when provided a selector and element where " +
        "the element is not a child of the selection",
      function() {
        var el = {
          parentElement: null,
          matches() {
            return true;
          }
        };
        var match = DOMUtils.closest(el, ".fake-selector");

        expect(match).toEqual(null);
      }
    );

    it(
      "returns the provided element when the provided element" +
        "matches the selector AND has a parent element",
      function() {
        var el = {
          parentElement: {
            id: "something-fake",
            matches() {
              return false;
            }
          },
          id: "child-element",
          matches() {
            return true;
          }
        };
        var match = DOMUtils.closest(el, ".fake-selector");

        expect(match.id).toEqual("child-element");
      }
    );
  });

  describe("#getComputedWidth", function() {
    function buildElement(style) {
      return `<div style="${style.join(";")}"></div>`;
    }

    beforeEach(function() {
      this.style = ["width: 100px"];
    });

    it("calculates left padding", function() {
      this.style.push("padding-left: 1px");
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");
      // jsdom doesn't calculate offsetWidth
      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates right padding", function() {
      this.style.push("padding-right: 1px");
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates left border", function() {
      this.style.push("border-left-width: 1px");
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates right border", function() {
      this.style.push("border-right-width: 1px");
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 101)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("calculates computed width", function() {
      this.style.push(
        "padding-left: 1px",
        "padding-right: 1px",
        "border-left-width: 1px",
        "border-right-width: 1px"
      );
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 104)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });

    it("does not calculate unnecessary properties", function() {
      this.style.push(
        "padding-top: 1px",
        "padding-bottom: 1px",
        "border-top-width: 1px",
        "border-bottom-width: 1px"
      );
      global.document.body.innerHTML = buildElement(this.style);
      const div = global.document.querySelector("div");

      Object.defineProperty(div, "offsetWidth", {
        get: jest.fn(() => 100)
      });

      var width = DOMUtils.getComputedWidth(div);
      expect(width).toEqual(100);
    });
  });

  describe("#scrollTo", function() {
    beforeEach(function() {
      this.previousRequest = global.requestAnimationFrame;
      global.requestAnimationFrame = function(func) {
        setTimeout(func, 15);
      };

      this.dateNow = Date.now;
      // Will return 0, 15, 30, 45, 60, etc.
      // adding setTimeout call time each time
      var now = -15;
      Date.now = function() {
        now += 15;

        return now;
      };
    });

    afterEach(function() {
      global.requestAnimationFrame = this.previousRequest;
      Date.now = this.dateNow;
    });

    it("doesn't do anything if already scrolled there", function() {
      var container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1000, 500);
      expect(container.scrollTop).toEqual(500);
    });

    it("begins heading towards the target pixel", function() {
      var container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1000, 1000);
      jest.runAllTimers();
      expect(container.scrollTop).toBeGreaterThan(1000);
    });

    it("stops after scrollDuration has passed", function() {
      var container = { scrollTop: 500, scrollHeight: 1500 };
      DOMUtils.scrollTo(container, 1500, 1000);
      var callCount = 0;
      global.requestAnimationFrame = function(func) {
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

  describe("#getDistanceFromTopOfParent", function() {
    beforeEach(function() {
      this.element = {
        getBoundingClientRect() {
          return {
            top: 300
          };
        },
        parentNode: {
          getBoundingClientRect() {
            return {
              top: 200
            };
          }
        }
      };
    });

    it("gets the correct distance from parent top", function() {
      var result = DOMUtils.getDistanceFromTopOfParent(this.element);

      expect(result).toEqual(100);
    });

    it("returns 0 if there is no parentNode", function() {
      const prevParentNode = this.element.parentNode;
      this.element.parentNode = null;

      var result = DOMUtils.getDistanceFromTopOfParent(this.element);
      expect(result).toEqual(0);

      this.element.parentNode = prevParentNode;
    });
  });

  describe("#getInputElement", function() {
    function buildElementWithNoInput() {
      global.document.body.innerHTML = "<div><span>Only text here</span></div>";

      return global.document.body.querySelector("div");
    }
    function buildElementInput() {
      global.document.body.innerHTML =
        "<div><span><input type='text' /></span></div>";

      return global.document.body.querySelector("div");
    }
    function buildElementTextarea() {
      global.document.body.innerHTML =
        "<div><span><textarea></textarea></span></div>";

      return global.document.body.querySelector("div");
    }
    function buildElementWithTwoTextareas() {
      global.document.body.innerHTML =
        "<div><span><textarea></textarea><textarea></textarea></span></div>";

      return global.document.body.querySelector("div");
    }

    const input = buildElementInput();
    const textarea = buildElementTextarea();
    const textareas = buildElementWithTwoTextareas();

    it("returns null if DOM element is without an input/ textarea", function() {
      expect(DOMUtils.getInputElement(buildElementWithNoInput())).toEqual(null);
    });

    it("returns null if empty string is entered", function() {
      expect(DOMUtils.getInputElement("")).toEqual(null);
    });
    it("returns null if a string is entered", function() {
      expect(DOMUtils.getInputElement("asdf")).toEqual(null);
    });
    it("returns null if an array is entered", function() {
      expect(DOMUtils.getInputElement([1, 2, 3])).toEqual(null);
    });
    it("returns null if null entered", function() {
      expect(null).toEqual(null);
    });

    it("returns input element if DOM element is an input", function() {
      const returnValue = DOMUtils.getInputElement(
        input.querySelector("input")
      );
      expect(returnValue.nodeName.toLowerCase()).toEqual("input");
    });
    it("returns textarea element if DOM element is an textarea", function() {
      const returnValue = DOMUtils.getInputElement(
        textarea.querySelector("textarea")
      );
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
    it("returns input element if DOM element has an input", function() {
      const returnValue = DOMUtils.getInputElement(input);
      expect(returnValue.nodeName.toLowerCase()).toEqual("input");
    });
    it("returns textarea element if DOM element has an textarea", function() {
      const returnValue = DOMUtils.getInputElement(textarea);
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
    it("returns textarea element if DOM element has two textareas", function() {
      const returnValue = DOMUtils.getInputElement(textareas);
      expect(returnValue.nodeName.toLowerCase()).toEqual("textarea");
    });
  });
});
