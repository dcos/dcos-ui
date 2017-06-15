const HEIGHT_ATTRIBUTES = [
  "paddingTop",
  "paddingBottom",
  "borderTopWidth",
  "borderBottomWidth"
];
const WIDTH_ATTRIBUTES = [
  "paddingLeft",
  "paddingRight",
  "borderLeftWidth",
  "borderRightWidth"
];

const matchesFn = (function() {
  const el = global.document.querySelector("body");
  const names = [
    "matches",
    "matchesSelector",
    "msMatchesSelector",
    "oMatchesSelector",
    "mozMatchesSelector",
    "webkitMatchesSelector"
  ];

  for (let i = 0; i < names.length; i++) {
    if (el[names[i]]) {
      return names[i];
    }
  }

  return names[0];
})();

var DOMUtils = {
  appendScript(el, code) {
    const scriptNode = global.document.createElement("script");
    scriptNode.type = "text/javascript";

    try {
      scriptNode.appendChild(global.document.createTextNode(code));
    } catch (e) {
      scriptNode.text = code;
    }

    el.appendChild(scriptNode);
  },

  closest(el, selector) {
    var currentEl = el;

    while (currentEl && currentEl.parentElement !== null) {
      if (currentEl[matchesFn] && currentEl[matchesFn](selector)) {
        return currentEl;
      }

      currentEl = currentEl.parentElement;
    }

    return null;
  },

  getComputedHeight(obj) {
    return DOMUtils.getComputedDimensions(obj).height;
  },

  getComputedWidth(obj) {
    return DOMUtils.getComputedDimensions(obj).width;
  },

  getComputedDimensions(obj) {
    var compstyle;
    if (typeof global.getComputedStyle === "undefined") {
      compstyle = obj.currentStyle;
    } else {
      compstyle = global.getComputedStyle(obj);
    }

    var computeInnerBound = function(acc, key) {
      var val = parseInt(compstyle[key], 10);
      if (Number.isNaN(val)) {
        return acc;
      } else {
        return acc - val;
      }
    };

    var width = WIDTH_ATTRIBUTES.reduce(computeInnerBound, obj.offsetWidth);

    var height = HEIGHT_ATTRIBUTES.reduce(computeInnerBound, obj.offsetHeight);

    return {
      width,
      height
    };
  },

  getPageHeight() {
    var body = global.document.body;
    var html = global.document.documentElement;

    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
  },

  getDistanceFromTop(element) {
    return element.pageYOffset || element.scrollTop || 0;
  },

  isTopFrame() {
    try {
      return global.self === global.top;
    } catch (e) {
      return true;
    }
  },

  // This will ease in and ease out of the transition.
  // Code was modified from this answer:
  // http://stackoverflow.com/questions/21474678/scrolltop-animation-without-jquery
  scrollTo(container, scrollDuration, targetY, callback) {
    const scrollHeight = container.scrollHeight;
    const scrollStep = Math.PI / (scrollDuration / 15);
    const cosParameter = scrollHeight / 2;
    let scrollCount = 0;
    let scrollMargin;

    requestAnimationFrame(step);
    const endTime = Date.now() + scrollDuration;

    function step() {
      setTimeout(function() {
        const distanceFromTop = DOMUtils.getDistanceFromTop(container);
        if (distanceFromTop !== targetY && endTime >= Date.now()) {
          requestAnimationFrame(step);
          scrollCount = scrollCount + 1;
          scrollMargin =
            cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
          container.scrollTop = distanceFromTop + scrollMargin;
        } else if (typeof callback === "function") {
          callback();
        }
      }, 15);
    }
  },

  whichTransitionEvent(el) {
    var transitions = {
      transition: "transitionend",
      OTransition: "oTransitionEnd",
      MozTransition: "transitionend",
      WebkitTransition: "webkitTransitionEnd"
    };

    for (var t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  },

  isElementOnTop(el) {
    const { left, top, height, width } = el.getBoundingClientRect();
    const elAtPoint = global.document.elementFromPoint(
      // The coords of the middle of the element.
      left + width / 2,
      top + height / 2
    );

    // If elAtPoint is null, then the element is off the screen. We return true
    // here.
    if (elAtPoint == null) {
      return true;
    }

    // We need to also use #contains because the elAtPoint may be a child.
    // We also need to check if elAtPoint contains el because it might select
    // the parent even if the el is showing.
    return el === elAtPoint || el.contains(elAtPoint) || elAtPoint.contains(el);
  },

  getDistanceFromTopOfParent(el) {
    const elTop = el.getBoundingClientRect().top;

    const parentNode = el.parentNode;
    if (!parentNode) {
      return 0;
    }

    const parentTop = parentNode.getBoundingClientRect().top;

    return elTop - parentTop;
  }
};

module.exports = DOMUtils;
