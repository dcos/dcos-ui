import UniversePackage from "../../structs/UniversePackage";

import * as React from "react";
import { shallow } from "enzyme";
import { unwrapped } from "../FrameworkConfigurationForm";

const FrameworkConfigurationForm = unwrapped();

function createWrapper(formData, packageDetails) {
  return shallow(
    <FrameworkConfigurationForm
      packageDetails={packageDetails}
      jsonEditorActive={false}
      formData={formData}
      formErrors={{}}
      focusField={""}
      activeTab={""}
      onFormDataChange={jest.fn()}
      onFormErrorChange={jest.fn()}
      onFormSubmit={jest.fn()}
      handleActiveTabChange={jest.fn()}
      handleFocusFieldChange={jest.fn()}
    />
  );
}

describe("FrameworkConfigurationForm", () => {
  describe("validate", () => {
    it("add error is required key is empty", () => {
      const addError = jest.fn();
      const formData = {
        foo: "",
        bar: 0,
      };
      const formErrors = {
        foo: {
          addError,
        },
        bar: {
          addError,
        },
      };
      const testPackage = new UniversePackage({
        config: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              default: "foo",
            },
            bar: {
              type: "number",
            },
          },
          required: ["foo"],
        },
      });

      const instance = createWrapper(formData, testPackage).instance();

      instance.validate(formData, formErrors);

      expect(addError).toHaveBeenCalledWith("Expecting a string here, eg: foo");
    });

    it("handle an array value", () => {
      const addError = jest.fn();
      const formData = {
        foo: "",
        bar: [
          {
            key: "env",
            value: "MYTEST=true",
          },
        ],
      };
      const formErrors = {
        foo: {
          addError,
        },
        bar: {
          addError,
        },
      };
      const testPackage = new UniversePackage({
        config: {
          type: "object",
          properties: {
            foo: {
              type: "string",
              default: "foo",
            },
            bar: {
              type: "array",
            },
          },
          required: [],
        },
      });

      const instance = createWrapper(formData, testPackage).instance();

      instance.validate(formData, formErrors);

      expect(addError).not.toHaveBeenCalled();
    });
  });
});
