var DOMProperty = require('react/lib/DOMProperty');

var svgAttrs = ['dominant-baseline', 'shape-rendering', 'mask'];
// hack for getting react to render svg attributes
DOMProperty.injection.injectDOMPropertyConfig({
  DOMAttributeNames: {
    fillRule: 'fill-rule'
  },
  isCustomAttribute: function (attribute) {
    return svgAttrs.includes(attribute);
  },
  Properties: {
    fillRule: DOMProperty.injection.MUST_USE_ATTRIBUTE
  }
});
