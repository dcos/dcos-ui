jest.dontMock('../DOMUtils');

var DOMUtils = require('../DOMUtils');

describe('DOMUtils', function () {

  describe('#getComputedWidth', function () {
    function buildElement(style) {
      return `<div style="${style.join(';')}"></div>`;
    }

    beforeEach(function () {
      this.style = [
        'width: 100px'
      ];
    });

    it('calculates left padding', function () {
      this.style.push('padding-left: 1px');
      document.body.innerHTML = buildElement(this.style);

      // jsdom doesn't calculate
      document.querySelector('div').offsetWidth = 101;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

    it('calculates right padding', function () {
      this.style.push('padding-right: 1px');
      document.body.innerHTML = buildElement(this.style);
      document.querySelector('div').offsetWidth = 101;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

    it('calculates left border', function () {
      this.style.push('border-left-width: 1px');
      document.body.innerHTML = buildElement(this.style);
      document.querySelector('div').offsetWidth = 101;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

    it('calculates right border', function () {
      this.style.push('border-right-width: 1px');
      document.body.innerHTML = buildElement(this.style);
      document.querySelector('div').offsetWidth = 101;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

    it('calculates computed width', function () {
      this.style.push(
        'padding-left: 1px',
        'padding-right: 1px',
        'border-left-width: 1px',
        'border-right-width: 1px'
      );
      document.body.innerHTML = buildElement(this.style);
      document.querySelector('div').offsetWidth = 104;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

    it('does not calculate unnecessary properties', function () {
      this.style.push(
        'padding-top: 1px',
        'padding-bottom: 1px',
        'border-top-width: 1px',
        'border-bottom-width: 1px'
      );
      document.body.innerHTML = buildElement(this.style);
      document.querySelector('div').offsetWidth = 100;

      var width = DOMUtils.getComputedWidth(document.querySelector('div'));
      expect(width).toEqual(100);
    });

  });

  describe('#scrollTo', function () {
    beforeEach(function () {
      this.previousRequest = global.requestAnimationFrame;
      global.requestAnimationFrame = function (func) {
        setTimeout(func, 15);
      };

      this.dateNow = Date.now;
      // Will return 0, 15, 30, 45, 60, etc.
      // adding setTimeout call time each time
      var now = -15;
      Date.now = function () {
        now += 15;
        return now;
      };
    });

    afterEach(function () {
      global.requestAnimationFrame = this.previousRequest;
      Date.now = this.dateNow;
    });

    it('doesn\'t do anything if already scrolled there', function () {
      var container = {scrollTop: 500, scrollHeight: 1500};
      DOMUtils.scrollTo(container, 1000, 500);
      expect(container.scrollTop).toEqual(500);
    });

    it('begins heading towards the target pixel', function () {
      var container = {scrollTop: 500, scrollHeight: 1500};
      DOMUtils.scrollTo(container, 1000, 1000);
      jest.runAllTimers();
      expect(container.scrollTop).toBeGreaterThan(1000);
    });

    it('stops after scrollDuration has passed', function () {
      var container = {scrollTop: 500, scrollHeight: 1500};
      DOMUtils.scrollTo(container, 1500, 1000);
      var callCount = 0;
      global.requestAnimationFrame = function (func) {
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

  describe('#isElementOnTop', function () {
    beforeEach(function () {
      this.element = {
        getBoundingClientRect: function () {
          return {
            top: 100,
            left: 200,
            height: 20,
            width: 40
          };
        },
        contains: function (el) {
          return this === el;
        }
      }
      this.prevElementFromPoint = global.document.elementFromPoint;
    });

    afterEach(function () {
      global.document.elementFromPoint = this.prevElementFromPoint;
    });

    it('should return false if element is not at coord', function () {
      global.document.elementFromPoint = function () {
        return 'hi';
      };

      let result = DOMUtils.isElementOnTop(this.element);
      expect(result).toEqual(false);
    });

    it('should return true if element is at coord', function () {
      global.document.elementFromPoint = () => {
        return this.element;
      };

      let result = DOMUtils.isElementOnTop(this.element);
      expect(result).toEqual(true);
    });
  });
});
