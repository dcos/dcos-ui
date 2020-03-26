const HEIGHT_ATTRIBUTES = [
  "paddingTop",
  "paddingBottom",
  "borderTopWidth",
  "borderBottomWidth",
];
const WIDTH_ATTRIBUTES = [
  "paddingLeft",
  "paddingRight",
  "borderLeftWidth",
  "borderRightWidth",
];

const matchesFn = (() => {
  const el = document.querySelector("body");
  const names = [
    "matches",
    "matchesSelector",
    "msMatchesSelector",
    "oMatchesSelector",
    "mozMatchesSelector",
    "webkitMatchesSelector",
  ];

  for (let i = 0; i < names.length; i++) {
    if (el[names[i]]) {
      return names[i];
    }
  }

  return names[0];
})();

const DOMUtils = {
  appendScript(el, code) {
    const scriptNode = document.createElement("script");
    scriptNode.type = "text/javascript";

    try {
      scriptNode.appendChild(document.createTextNode(code));
    } catch (e) {
      scriptNode.text = code;
    }

    el.appendChild(scriptNode);
  },

  closest(el, selector) {
    let currentEl = el;

    while (currentEl && currentEl.parentElement !== null) {
      if (currentEl[matchesFn] && currentEl[matchesFn](selector)) {
        return currentEl;
      }

      currentEl = currentEl.parentElement;
    }

    return null;
  },

  getComputedWidth(obj) {
    return DOMUtils.getComputedDimensions(obj).width;
  },

  getComputedDimensions(obj) {
    let compstyle;
    if (typeof window.getComputedStyle === "undefined") {
      compstyle = obj.currentStyle;
    } else {
      compstyle = window.getComputedStyle(obj);
    }

    const computeInnerBound = (acc, key) => {
      const val = parseInt(compstyle[key], 10);
      return Number.isNaN(val) ? acc : acc - val;
    };

    const width = WIDTH_ATTRIBUTES.reduce(computeInnerBound, obj.offsetWidth);
    const height = HEIGHT_ATTRIBUTES.reduce(
      computeInnerBound,
      obj.offsetHeight
    );

    return {
      width,
      height,
    };
  },

  getDistanceFromTop(element) {
    return element.pageYOffset || element.scrollTop || 0;
  },

  // This will ease in and ease out of the transition.
  // Code was modified from this answer:
  // http://stackoverflow.com/questions/21474678/scrolltop-animation-without-jquery
  scrollTo(container, scrollDuration, targetY) {
    const scrollHeight = container.scrollHeight;
    const scrollStep = Math.PI / (scrollDuration / 15);
    const cosParameter = scrollHeight / 2;
    let scrollCount = 0;
    let scrollMargin;

    requestAnimationFrame(step);
    const endTime = Date.now() + scrollDuration;

    function step() {
      setTimeout(() => {
        const distanceFromTop = DOMUtils.getDistanceFromTop(container);
        if (distanceFromTop !== targetY && endTime >= Date.now()) {
          requestAnimationFrame(step);
          scrollCount = scrollCount + 1;
          scrollMargin =
            cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
          container.scrollTop = distanceFromTop + scrollMargin;
        }
      }, 15);
    }
  },

  getDistanceFromTopOfParent(el) {
    const elTop = el.getBoundingClientRect().top;
    const parentNode = el.parentNode;
    return parentNode ? elTop - parentNode.getBoundingClientRect().top : 0;
  },

  getInputElement(node) {
    if (!node || !(node instanceof HTMLElement)) {
      return null;
    }
    const inputTypes = ["input", "textarea"];
    return inputTypes.includes(node.nodeName.toLowerCase())
      ? node
      : node.querySelector(inputTypes.join(", "));
  },
};

export default DOMUtils;
