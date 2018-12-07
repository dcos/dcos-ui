const React = require("react");
const { shallow } = require("enzyme");

const {
  default: FrameworkConfigurationForm
} = require("../FrameworkConfigurationForm");
const UniversePackage = require("../../structs/UniversePackage");

function createWrapper(formData, formErrors, packageDetails) {
  return shallow(
    <FrameworkConfigurationForm
      packageDetails={packageDetails}
      jsonEditorActive={false}
      formData={formData}
      formErrors={formErrors}
      focusField={""}
      activeTab={""}
      onFormDataChange={jest.fn()}
      onFormErrorChange={jest.fn()}
      handleActiveTabChange={jest.fn()}
      handleFocusFieldChange={jest.fn()}
    />
  );
}

describe("FrameworkConfigurationForm", function() {
  describe("validate", function() {
    it("should add error is required key is empty", function() {
      const addError = jest.fn();
      const formData = {
        foo: "",
        bar: 0
      };
      const formErrors = {
        foo: {
          addError
        },
        bar: {
          addError
        }
      };
      const testPackage = new UniversePackage({
        config: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              default: "foo"
            },
            bar: {
              type: "number"
            }
          },
          required: ["foo"]
        }
      });

      const instance = createWrapper(
        formData,
        formErrors,
        testPackage
      ).instance();

      instance.validate(formData, formErrors);

      expect(addError).toHaveBeenCalledWith("Expecting a string here, eg: foo");
    });

    it("should handle an array value", function() {
      const addError = jest.fn();
      const formData = {
        foo: "",
        bar: [
          {
            key: "env",
            value: "MYTEST=true"
          }
        ]
      };
      const formErrors = {
        foo: {
          addError
        },
        bar: {
          addError
        }
      };
      const testPackage = new UniversePackage({
        config: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              default: "foo"
            },
            bar: {
              type: "array"
            }
          },
          required: []
        }
      });

      const instance = createWrapper(
        formData,
        formErrors,
        testPackage
      ).instance();

      instance.validate(formData, formErrors);

      expect(addError).not.toHaveBeenCalled();
    });
  });
});
