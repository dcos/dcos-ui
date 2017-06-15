jest.dontMock("../ConfigurationMap");
jest.dontMock("../ReviewConfig");

/* eslint-disable no-unused-vars */
const React = require("react");
/* eslint-enable no-unused-vars */
const ReactDOM = require("react-dom");

const ConfigurationMap = require("../ConfigurationMap");
const ReviewConfig = require("../ReviewConfig");

describe("ReviewConfig", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
  });

  afterEach(function() {
    ReactDOM.unmountComponentAtNode(this.container);
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
        this.container
      );

      var result = instance.getDefinitionReview();

      expect(result.type instanceof ConfigurationMap.constructor).toBeTruthy();
    });
  });
});
