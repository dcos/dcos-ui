import FormUtil from "../FormUtil";

let thisDefinition, thisResult;

describe("FormUtil", () => {
  describe("#getMultipleFieldDefinition", () => {
    beforeEach(() => {
      thisDefinition = [
        {
          name: "key",
          value: null,
        },
        {
          name: "value",
          value: null,
        },
      ];
    });

    it("sets the correct name for the definition", () => {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(result[1].name).toEqual("variable[1].value");
    });

    it("does not modify the definition", () => {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(thisDefinition[0].name).toEqual("key");
    });

    it("sets the value if a model is passed", () => {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition,
        {
          key: "kenny",
          value: "tran",
        }
      );

      expect(result[0].value).toEqual("kenny");
      expect(result[1].value).toEqual("tran");
    });
  });

  describe("#modelToCombinedProps", () => {
    beforeEach(() => {
      thisResult = FormUtil.modelToCombinedProps({
        "uid[0].uid": "kenny",
        "uid[0].password": "secret",
        "uid[1].uid": "jane",
        "uid[1].password": "secret2",
        unrelatedProp: "hellothere",
      });
    });

    it("does not modify the unrelated properties", () => {
      expect(thisResult.unrelatedProp).toEqual("hellothere");
    });

    it('creates a property named "uid" that is an array', () => {
      expect(Array.isArray(thisResult.uid)).toEqual(true);
    });

    it("converts each instance into an object", () => {
      expect(typeof thisResult.uid[0]).toEqual("object");
    });

    it("converts each instance with the correct values", () => {
      expect(thisResult.uid[0].uid).toEqual("kenny");
      expect(thisResult.uid[0].password).toEqual("secret");
      expect(thisResult.uid[1].uid).toEqual("jane");
      expect(thisResult.uid[1].password).toEqual("secret2");
    });
  });

  describe("#isFieldInstanceOfProp", () => {
    it("returns true if field is instance of prop", () => {
      const fields = [
        { name: "variable[2].key", value: "kenny" },
        { name: "variable[2].value", value: "tran" },
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(true);
    });

    it("returns false if field is not instance of prop", () => {
      const fields = [
        { name: "variable[1].key", value: "kenny" },
        { name: "variable[1].value", value: "tran" },
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(false);
    });

    it("works on a single definition", () => {
      const field = { name: "variable[1].key", value: "kenny" };
      const result = FormUtil.isFieldInstanceOfProp("variable", field, 1);
      expect(result).toEqual(true);
    });
  });

  describe("#removePropID", () => {
    it("removes the fields with that property", () => {
      const definition = [
        { name: "password", value: "secret" },
        { name: "variable[1].key", value: "kenny" },
        { name: "variable[1].value", value: "tran" },
        { name: "variable[2].key", value: "mat" },
        { name: "variable[2].value", value: "app" },
      ];

      FormUtil.removePropID(definition, "variable", 1);

      const expectedResult = [
        { name: "password", value: "secret" },
        { name: "variable[2].key", value: "mat" },
        { name: "variable[2].value", value: "app" },
      ];

      expect(definition).toEqual(expectedResult);
    });
  });

  describe("#forEachDefinition", () => {
    beforeEach(() => {
      thisDefinition = {
        general: {
          definition: [
            {
              name: "command",
              fieldType: "text",
            },
            {
              name: "cpu",
              fieldType: "number",
            },
          ],
        },
        labels: {
          definition: [
            {
              name: "key",
              fieldType: "text",
            },
            {
              name: "value",
              fieldType: "text",
            },
          ],
        },
      };
    });

    it("correctly iterates through each definition", () => {
      const result = [];
      FormUtil.forEachDefinition(thisDefinition, (fieldDefinition) => {
        result.push(fieldDefinition.name);
      });

      expect(result).toEqual(["command", "cpu", "key", "value"]);
    });
  });
});
