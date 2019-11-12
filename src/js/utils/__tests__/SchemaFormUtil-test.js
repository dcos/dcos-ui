const SchemaFormUtil = require("../SchemaFormUtil");

let thisDefinition, thisGetDefinitionFromPath;

describe("SchemaFormUtil", () => {
  describe("#getDefinitionFromPath", () => {
    beforeEach(() => {
      thisDefinition = {
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

    it("finds 'treasure' definition", () => {
      var path = ["application", "there", "treasure"];
      var result = SchemaFormUtil.getDefinitionFromPath(thisDefinition, path);

      expect(result).toEqual({ name: "treasure" });
    });

    it("finds 'hello' definition", () => {
      var path = ["application", "hello"];
      var result = SchemaFormUtil.getDefinitionFromPath(thisDefinition, path);

      expect(result).toEqual({ name: "hello", someProp: 10 });
    });
  });

  describe("#processFormModel", () => {
    beforeEach(() => {
      var definition = (thisDefinition = {
        isRequired: false,
        valueType: "string"
      });
      thisGetDefinitionFromPath = SchemaFormUtil.getDefinitionFromPath;
      SchemaFormUtil.getDefinitionFromPath = () => definition;
    });

    afterEach(() => {
      thisDefinition = {
        isRequired: false,
        valueType: "string"
      };
      SchemaFormUtil.getDefinitionFromPath = thisGetDefinitionFromPath;
    });

    it("returns a model with same values", () => {
      var model = {
        key: "value",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(model).toEqual(result);
    });

    it("replaces undefined with [] when valueType is array", () => {
      thisDefinition.valueType = "array";
      var model = {
        key: undefined,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual([]);
    });

    it("omits null values for non-required fields", () => {
      var model = {
        key: null,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(undefined);
    });

    it("doesn't omit null values for required fields", () => {
      thisDefinition.isRequired = true;
      var model = {
        key: null,
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(null);
    });

    it("replaces string with a number if integer", () => {
      thisDefinition.valueType = "integer";
      var model = {
        key: "10",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(10);
    });

    it("splits string if array", () => {
      thisDefinition.valueType = "array";
      var model = {
        key: "10, 20, 30, 40",
        key2: "value2"
      };

      var result = SchemaFormUtil.processFormModel(model);
      expect(result.key).toEqual(["10", "20", "30", "40"]);
    });
  });

  describe("#parseTV4Error", () => {
    it("returns an object with error message and path", () => {
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

    it("appends param if code is 302", () => {
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

    it("removes the last path if it is part of an array", () => {
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
