const FormUtil = require("../FormUtil");

let thisDefinition, thisResult;

describe("FormUtil", function() {
  describe("#getMultipleFieldDefinition", function() {
    beforeEach(function() {
      thisDefinition = [
        {
          name: "key",
          value: null
        },
        {
          name: "value",
          value: null
        }
      ];
    });

    it("sets the correct name for the definition", function() {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(result[1].name).toEqual("variable[1].value");
    });

    it("does not modify the definition", function() {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(thisDefinition[0].name).toEqual("key");
    });

    it("sets the value if a model is passed", function() {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        thisDefinition,
        {
          key: "kenny",
          value: "tran"
        }
      );

      expect(result[0].value).toEqual("kenny");
      expect(result[1].value).toEqual("tran");
    });
  });

  describe("#modelToCombinedProps", function() {
    beforeEach(function() {
      thisResult = FormUtil.modelToCombinedProps({
        "uid[0].uid": "kenny",
        "uid[0].password": "secret",
        "uid[1].uid": "jane",
        "uid[1].password": "secret2",
        unrelatedProp: "hellothere"
      });
    });

    it("does not modify the unrelated properties", function() {
      expect(thisResult.unrelatedProp).toEqual("hellothere");
    });

    it('creates a property named "uid" that is an array', function() {
      expect(Array.isArray(thisResult.uid)).toEqual(true);
    });

    it("converts each instance into an object", function() {
      expect(typeof thisResult.uid[0]).toEqual("object");
    });

    it("converts each instance with the correct values", function() {
      expect(thisResult.uid[0].uid).toEqual("kenny");
      expect(thisResult.uid[0].password).toEqual("secret");
      expect(thisResult.uid[1].uid).toEqual("jane");
      expect(thisResult.uid[1].password).toEqual("secret2");
    });
  });

  describe("#isFieldInstanceOfProp", function() {
    it("returns true if field is instance of prop", function() {
      const fields = [
        { name: "variable[2].key", value: "kenny" },
        { name: "variable[2].value", value: "tran" }
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(true);
    });

    it("returns false if field is not instance of prop", function() {
      const fields = [
        { name: "variable[1].key", value: "kenny" },
        { name: "variable[1].value", value: "tran" }
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(false);
    });

    it("works on a single definition", function() {
      const field = { name: "variable[1].key", value: "kenny" };
      const result = FormUtil.isFieldInstanceOfProp("variable", field, 1);
      expect(result).toEqual(true);
    });
  });

  describe("#removePropID", function() {
    it("removes the fields with that property", function() {
      const definition = [
        { name: "password", value: "secret" },
        { name: "variable[1].key", value: "kenny" },
        { name: "variable[1].value", value: "tran" },
        { name: "variable[2].key", value: "mat" },
        { name: "variable[2].value", value: "app" }
      ];

      FormUtil.removePropID(definition, "variable", 1);

      const expectedResult = [
        { name: "password", value: "secret" },
        { name: "variable[2].key", value: "mat" },
        { name: "variable[2].value", value: "app" }
      ];

      expect(definition).toEqual(expectedResult);
    });
  });

  describe("#forEachDefinition", function() {
    beforeEach(function() {
      thisDefinition = {
        general: {
          definition: [
            {
              name: "command",
              fieldType: "text"
            },
            {
              name: "cpu",
              fieldType: "number"
            }
          ]
        },
        labels: {
          definition: [
            {
              name: "key",
              fieldType: "text"
            },
            {
              name: "value",
              fieldType: "text"
            }
          ]
        }
      };
    });

    it("correctly iterates through each definition", function() {
      const result = [];
      FormUtil.forEachDefinition(thisDefinition, function(fieldDefinition) {
        result.push(fieldDefinition.name);
      });

      expect(result).toEqual(["command", "cpu", "key", "value"]);
    });
  });

  describe("#isFieldDefinition", function() {
    it("returns false if it is not a definition", function() {
      const result = FormUtil.isFieldDefinition({ render() {} });
      expect(result).toEqual(false);
    });

    it("returns false if it is not an object", function() {
      const result = FormUtil.isFieldDefinition(null);
      expect(result).toEqual(false);
    });

    it("returns true if it is a definition", function() {
      const result = FormUtil.isFieldDefinition({
        name: "username",
        fieldType: "text"
      });
      expect(result).toEqual(true);
    });
  });
});
