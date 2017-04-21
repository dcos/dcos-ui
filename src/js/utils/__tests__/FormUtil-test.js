jest.dontMock("../FormUtil");

const FormUtil = require("../FormUtil");

describe("FormUtil", function() {
  describe("#getMultipleFieldDefinition", function() {
    beforeEach(function() {
      this.definition = [
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
        this.definition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(result[1].name).toEqual("variable[1].value");
    });

    it("does not modify the definition", function() {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        this.definition
      );

      expect(result[0].name).toEqual("variable[1].key");
      expect(this.definition[0].name).toEqual("key");
    });

    it("sets the value if a model is passed", function() {
      const result = FormUtil.getMultipleFieldDefinition(
        "variable",
        1,
        this.definition,
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
      this.result = FormUtil.modelToCombinedProps({
        "uid[0].uid": "kenny",
        "uid[0].password": "secret",
        "uid[1].uid": "jane",
        "uid[1].password": "secret2",
        unrelatedProp: "hellothere"
      });
    });

    it("should not modify the unrelated properties", function() {
      expect(this.result.unrelatedProp).toEqual("hellothere");
    });

    it('should create a property named "uid" that is an array', function() {
      expect(Array.isArray(this.result.uid)).toEqual(true);
    });

    it("should convert each instance into an object", function() {
      expect(typeof this.result.uid[0]).toEqual("object");
    });

    it("should convert each instance with the correct values", function() {
      expect(this.result.uid[0].uid).toEqual("kenny");
      expect(this.result.uid[0].password).toEqual("secret");
      expect(this.result.uid[1].uid).toEqual("jane");
      expect(this.result.uid[1].password).toEqual("secret2");
    });
  });

  describe("#isFieldInstanceOfProp", function() {
    it("should return true if field is instance of prop", function() {
      const fields = [
        { name: "variable[2].key", value: "kenny" },
        { name: "variable[2].value", value: "tran" }
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(true);
    });

    it("should return false if field is not instance of prop", function() {
      const fields = [
        { name: "variable[1].key", value: "kenny" },
        { name: "variable[1].value", value: "tran" }
      ];
      const result = FormUtil.isFieldInstanceOfProp("variable", fields, 2);
      expect(result).toEqual(false);
    });

    it("should work on a single definition", function() {
      const field = { name: "variable[1].key", value: "kenny" };
      const result = FormUtil.isFieldInstanceOfProp("variable", field, 1);
      expect(result).toEqual(true);
    });
  });

  describe("#removePropID", function() {
    it("should remove the fields with that property", function() {
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
      this.definition = {
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
      FormUtil.forEachDefinition(this.definition, function(fieldDefinition) {
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
