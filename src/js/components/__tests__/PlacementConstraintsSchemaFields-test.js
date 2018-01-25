/* eslint-disable no-unused-vars */
var React = require("react");
/* eslint-enable no-unused-vars */

const renderer = require("react-test-renderer");

const PlacementConstraintsSchemaFields = require("../PlacementConstraintsSchemaField")
  .default;
const PlacementValidators = require("#PLUGINS/services/src/js/validators/PlacementsValidators.js");

describe("PlacementConstraintsSchemaField", function() {
  describe("with valid content", function() {
    beforeEach(function() {
      PlacementValidators.validateNoBatchError = () => true;
    });

    it("displays edit constraints area", function() {
      const fieldProps = {
        formData: "[['hostname', 'MAX_PER', '1']]",
        disabled: false,
        name: "placement_constraints"
      };
      this.instance = renderer.create(
        <PlacementConstraintsSchemaFields
          fieldProps={fieldProps}
          label="label"
          schema={{}}
        />
      );

      var tree = this.instance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe("with invalid content", function() {
    beforeEach(function() {
      PlacementValidators.validateNoBatchError = () => false;
    });

    it("displays form to edit constraints", function() {
      const fieldProps = {
        formData: "['hostname', 'MAX_PER', '2']",
        disabled: false,
        name: "placement_constraints"
      };

      this.instance = renderer.create(
        <PlacementConstraintsSchemaFields
          fieldProps={fieldProps}
          label="label"
          schema={{}}
        />
      );

      var tree = this.instance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
