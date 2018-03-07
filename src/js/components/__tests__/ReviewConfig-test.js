/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ConfigurationMap = require("../ConfigurationMap");
const ReviewConfig = require("../ReviewConfig");

let thisContainer;

describe("ReviewConfig", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#getDefinitionReview", function() {
    it("renders a configuration map", function() {
      var configuration = {
        foo: {
          bar: "baz",
          qux: "quux",
          corgly: "grault"
        }
      };

      var instance = ReactDOM.render(
        <ReviewConfig configuration={configuration} />,
        thisContainer
      );

      var result = instance.getDefinitionReview();

      expect(result.type instanceof ConfigurationMap.constructor).toBeTruthy();
    });
  });
});
