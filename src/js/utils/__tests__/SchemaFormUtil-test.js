jest.dontMock("../SchemaFormUtil");

const SchemaFormUtil = require("../SchemaFormUtil");

describe("SchemaFormUtil", function() {
  describe("#getDefinitionFromPath", function() {
    beforeEach(function() {
      this.definition = {
        application: {
          definition: [
            {
              name: "hello",
              someProp: 10
            },
            {
              title: "there",
              definition: [
                {
                  name: "treasure"
                }
              ]
            }
          ]
        }
      };
    });

    it("finds 'treasure' definition", function() {
      var path = ["application", "there", "treasure"];
      var result = SchemaFormUtil.getDefinitionFromPath(this.definition, path);

      expect(result).toEqual({ name: "treasure" });
    });

    it("finds 'hello' definition", function() {
      var path = ["application", "hello"];
      var result = SchemaFormUtil.getDefinitionFromPath(this.definition, path);

      expect(result).toEqual({ name: "hello", someProp: 10 });
    });
  });

  describe("#processFormModel", function() {
    beforeEach(function() {
      var definition = (this.definition = {
        isRequired: false,
        valueType: "string"
      });
      this.getDefinitionFromPath = SchemaFormUtil.getDefinitionFromPath;
      SchemaFormUtil.getDefinitionFromPath = function() {
        return definition;
      };
    });

    afterEach(function() {
      this.definition = {
        isRequired: false,
        valueType: "string"
      };
      SchemaFormUtil.getDefinitionFromPath = this.getDefinitionFromPath;
    });

    it("should return a model with same values", function() {
      var model = {
        key: "value",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(model).toEqual(result);
    });

    it("should replace undefined with [] when valueType is array", function() {
      this.definition.valueType = "array";
      var model = {
        key: undefined,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual([]);
    });

    it("should omit null values for non-required fields", function() {
      var model = {
        key: null,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(undefined);
    });

    it("shouldn't omit null values for required fields", function() {
      this.definition.isRequired = true;
      var model = {
        key: null,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(null);
    });

    it("should replace string with a number if integer", function() {
      this.definition.valueType = "integer";
      var model = {
        key: "10",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(10);
    });

    it("should split string if array", function() {
      this.definition.valueType = "array";
      var model = {
        key: "10, 20, 30, 40",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(["10", "20", "30", "40"]);
    });
  });

  describe("#parseTV4Error", function() {
    it("returns an object with error message and path", function() {
      var tv4Error = {
        dataPath: "application/data/path",
        message: "this is an error message",
        schemaPath: "properties/application/properties/data/path"
      };
      var result = SchemaFormUtil.parseTV4Error(tv4Error);

      expect(result).toEqual({
        message: "this is an error message",
        path: ["application", "data", "path"]
      });
    });

    it("appends param if code is 302", function() {
      var tv4Error = {
        code: 302,
        dataPath: "application/data/path",
        message: "this is an error message",
        params: { key: "another" },
        schemaPath: "properties/application/properties/data/path"
      };
      var result = SchemaFormUtil.parseTV4Error(tv4Error);

      expect(result).toEqual({
        message: "this is an error message",
        path: ["application", "data", "path", "another"]
      });
    });

    it("removes the last path if it is part of an array", function() {
      var tv4Error = {
        dataPath: "application/data/path/0",
        message: "this is an error message",
        schemaPath: "properties/application/properties/items/path"
      };
      var result = SchemaFormUtil.parseTV4Error(tv4Error);

      expect(result).toEqual({
        message: "this is an error message",
        path: ["application", "data", "path"]
      });
    });
  });
});
