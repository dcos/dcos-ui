var _ = require('underscore');

var DOMUtils = {
  appendScript: function (el, code) {
    let scriptNode = document.createElement('script');
    scriptNode.type = 'text/javascript';

    try {
      scriptNode.appendChild(document.createTextNode(code));
    } catch (e) {
      scriptNode.text = code;
    }

    el.appendChild(scriptNode);
  },

  getComputedWidth: function (obj) {
    return DOMUtils.getComputedDimensions(obj).width;
  },

  getComputedDimensions: function (obj) {
    var compstyle;
    if (typeof window.getComputedStyle === 'undefined') {
      compstyle = obj.currentStyle;
    } else {
      compstyle = window.getComputedStyle(obj);
    }

    var computeInnerBound = function (acc, key) {
      var val = parseInt(compstyle[key], 10);
      if (_.isNaN(val)) {
        return acc;
      } else {
        return acc - val;
      }
    };

    var width = _.foldl(
      ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'],
      computeInnerBound,
      obj.offsetWidth
    );

    var height = _.foldl(
      ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
      computeInnerBound,
      obj.offsetHeight
    );

    return {
      width: width,
      height: height
    };
  },

  getPageHeight: function () {
    var body = document.body;
    var html = document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  },

  getDistanceFromTop: function (element) {
    return element.pageYOffset || element.scrollTop || 0;
  },

  isTopFrame: function () {
    try {
      return window.self === window.top;
    } catch (e) {
      return true;
    }
  },

  // This will ease in and ease out of the transition.
  // Code was modified from this answer:
  // http://stackoverflow.com/questions/21474678/scrolltop-animation-without-jquery
  scrollTo: function (container, scrollDuration, targetY) {
    let scrollHeight = container.scrollHeight;
    let scrollStep = Math.PI / (scrollDuration / 15);
    let cosParameter = scrollHeight / 2;
    let scrollCount = 0;
    let scrollMargin;

    requestAnimationFrame(step);
    let endTime = Date.now() + scrollDuration;

    function step() {
      setTimeout(function () {
        let distanceFromTop = DOMUtils.getDistanceFromTop(container);
        if (distanceFromTop !== targetY && endTime >= Date.now()) {
          requestAnimationFrame(step);
          scrollCount = scrollCount + 1;
          scrollMargin = cosParameter -
            (cosParameter * Math.cos(scrollCount * scrollStep));
          container.scrollTop = distanceFromTop + scrollMargin;
        }
      }, 15);
    }
  },

  whichTransitionEvent: function (el) {
    var transitions = {
      'transition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'MozTransition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (var t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  },

  isElementOnTop: function (el) {
    let {left, top, height, width} = el.getBoundingClientRect();
    let elAtCoord = global.document.elementFromPoint(
      // The coords of the middle of the element.
      left + width / 2,
      top + height / 2
    );

    // We need to also use #contains because the elAtCoord may be a child.
    return el === elAtCoord || el.contains(elAtCoord);
  }
};

module.exports = DOMUtils;
