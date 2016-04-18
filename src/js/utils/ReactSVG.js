var _ = require('underscore');
var DOMProperty = require('react/lib/DOMProperty');

var svgAttrs = ['dominant-baseline', 'shape-rendering', 'mask'];
// hack for getting react to render svg attributes
DOMProperty.injection.injectDOMPropertyConfig({
  isCustomAttribute: function (attribute) {
    return _.contains(svgAttrs, attribute);
  }
});
