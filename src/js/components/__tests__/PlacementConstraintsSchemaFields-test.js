import PlacementValidators from "#PLUGINS/services/src/js/validators/PlacementsValidators";

const React = require("react");
const renderer = require("react-test-renderer");

const PlacementConstraintsSchemaFields = require("../PlacementConstraintsSchemaField")
  .default;

let thisValidateNoBatchErrorRestore, thisInstance;

describe("PlacementConstraintsSchemaField", () => {
  describe("with valid content", () => {
    beforeEach(() => {
      thisValidateNoBatchErrorRestore =
        PlacementValidators.validateNoBatchError;
      PlacementValidators.validateNoBatchError = () => true;
    });

    afterEach(() => {
      PlacementValidators.validateNoBatchError = thisValidateNoBatchErrorRestore;
    });

    it("displays edit constraints area", () => {
      const fieldProps = {
        formData: "[['hostname', 'MAX_PER', '1']]",
        disabled: false,
        name: "placement_constraints",
        schema: {}
      };
      thisInstance = renderer.create(
        <PlacementConstraintsSchemaFields
          fieldProps={fieldProps}
          label="label"
          schema={{}}
        />
      );

      var tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe("with invalid content", () => {
    beforeEach(() => {
      thisValidateNoBatchErrorRestore =
        PlacementValidators.validateNoBatchError;
      PlacementValidators.validateNoBatchError = () => false;
    });

    afterEach(() => {
      PlacementValidators.validateNoBatchError = thisValidateNoBatchErrorRestore;
    });

    it("displays form to edit constraints", () => {
      const fieldProps = {
        formData: "['hostname', 'MAX_PER', '2']",
        disabled: false,
        name: "placement_constraints"
      };

      thisInstance = renderer.create(
        <PlacementConstraintsSchemaFields
          fieldProps={fieldProps}
          label="label"
          schema={{}}
        />
      );

      var tree = thisInstance.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
