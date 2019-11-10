const SchemaUtil = require("../SchemaUtil");

let thisSubheaderRender, thisResult;

describe("SchemaUtil", () => {
  describe("#schemaToMultipleDefinition", () => {
    describe("not nested schema", () => {
      beforeEach(() => {
        var schema = {
          properties: {
            application: {
              description: "This is a description",
              properties: {
                id: {
                  type: "string"
                }
              },
              title: "Application"
            }
          }
        };

        thisSubheaderRender = jasmine.createSpy();
        thisResult = SchemaUtil.schemaToMultipleDefinition({
          schema,
          renderSubheader: thisSubheaderRender
        });
      });

      it("sets the title of the definition", () => {
        expect(thisResult.application.title).toEqual("Application");
      });

      it("creates a field for the property", () => {
        expect(thisResult.application).not.toEqual(undefined);
      });

      it("turns a schema to a definition", () => {
        expect(thisResult.application.description).toEqual(
          "This is a description"
        );
      });

      it("creates a definition for the field", () => {
        expect(Array.isArray(thisResult.application.definition)).toEqual(true);
      });

      it("does not call subheaderRender because schema is flat", () => {
        expect(thisSubheaderRender).not.toHaveBeenCalled();
      });
    });

    describe("schema with no second level properties", () => {
      const $scope = {};
      beforeEach(() => {
        var schema = {
          properties: {
            application: {
              description: "This is a description"
            }
          }
        };

        $scope.subheaderRender = jasmine.createSpy();
        $scope.result = SchemaUtil.schemaToMultipleDefinition({
          schema,
          renderSubheader: $scope.subheaderRender
        });
      });

      it("creates the definition", () => {
        expect($scope.result.application.definition).toEqual([]);
      });
    });

    describe("nested schema", () => {
      beforeEach(() => {
        var schema = {
          properties: {
            application: {
              description: "This is a description",
              properties: {
                id: {
                  properties: {
                    name: {
                      type: "string"
                    }
                  }
                }
              }
            }
          }
        };

        thisSubheaderRender = jasmine.createSpy();
        thisResult = SchemaUtil.schemaToMultipleDefinition({
          schema,
          renderSubheader: thisSubheaderRender
        });
      });

      it("creates a nested definition correctly", () => {
        expect(thisResult.application.definition[0].definition).not.toEqual(
          undefined
        );
      });

      it("creates render property with a render function", () => {
        expect(typeof thisResult.application.definition[0].render).toEqual(
          "function"
        );
      });
    });
  });

  describe("#definitionToJSONDocument", () => {
    beforeEach(() => {
      var definition = {
        application: {
          title: "Application",
          description: "Lorem ipsum dolor sit amet",
          definition: [
            {
              fieldType: "text",
              name: "Name",
              placeholder: "Name",
              required: false,
              showError: false,
              showLabel: true,
              writeType: "input",
              validation() {
                return true;
              },
              value: "nameValue"
            },
            {
              fieldType: "text",
              name: "CPU",
              placeholder: "CPU",
              required: false,
              showError: false,
              showLabel: true,
              writeType: "input",
              validation() {
                return true;
              },
              value: "CPU Value"
            }
          ]
        }
      };

      thisResult = SchemaUtil.definitionToJSONDocument(definition);
    });

    it("creates Application at the top level", () => {
      expect(typeof thisResult.application).toEqual("object");
    });

    it("creates properties for application", () => {
      expect(thisResult.application.Name).toEqual("nameValue");
      expect(thisResult.application.CPU).toEqual("CPU Value");
    });

    it("creates a nested json document correctly", () => {
      var definition = {
        application: {
          title: "Application",
          description: "Lorem ipsum dolor sit amet",
          definition: [
            {
              name: "Nested",
              definition: [
                {
                  fieldType: "text",
                  name: "CPU",
                  placeholder: "CPU",
                  required: false,
                  showError: false,
                  showLabel: true,
                  writeType: "input",
                  validation() {
                    return true;
                  },
                  value: "CPU Value"
                }
              ]
            }
          ]
        }
      };

      var result = SchemaUtil.definitionToJSONDocument(definition);
      expect(result.application.Nested.CPU).toEqual("CPU Value");
    });
  });

  describe("#validateSchema", () => {
    it("returns false for an invalid schema", () => {
      var result = SchemaUtil.validateSchema({ random: "properties" });
      expect(result).toEqual(false);
    });

    it("returns true for valid schema", () => {
      var schema = {
        properties: {
          application: {
            description: "This is a description",
            properties: {
              id: {
                properties: {
                  name: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      };
      var result = SchemaUtil.validateSchema(schema);
      expect(result).toEqual(true);
    });
  });
});
