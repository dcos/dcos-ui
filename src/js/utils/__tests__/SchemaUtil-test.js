const SchemaUtil = require("../SchemaUtil");

let thisSubheaderRender, thisResult;

describe("SchemaUtil", function() {
  describe("#schemaToMultipleDefinition", function() {
    describe("not nested schema", function() {
      beforeEach(function() {
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

      it("sets the title of the definition", function() {
        expect(thisResult.application.title).toEqual("Application");
      });

      it("creates a field for the property", function() {
        expect(thisResult.application).not.toEqual(undefined);
      });

      it("turns a schema to a definition", function() {
        expect(thisResult.application.description).toEqual(
          "This is a description"
        );
      });

      it("creates a definition for the field", function() {
        expect(Array.isArray(thisResult.application.definition)).toEqual(true);
      });

      it("does not call subheaderRender because schema is flat", function() {
        expect(thisSubheaderRender).not.toHaveBeenCalled();
      });
    });

    describe("schema with no second level properties", function() {
      const $scope = {};
      beforeEach(function() {
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

      it("creates the definition", function() {
        expect($scope.result.application.definition).toEqual([]);
      });
    });

    describe("nested schema", function() {
      beforeEach(function() {
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

      it("creates a nested definition correctly", function() {
        expect(thisResult.application.definition[0].definition).not.toEqual(
          undefined
        );
      });

      it("creates render property with a render function", function() {
        expect(typeof thisResult.application.definition[0].render).toEqual(
          "function"
        );
      });
    });
  });

  describe("#definitionToJSONDocument", function() {
    beforeEach(function() {
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

    it("creates Application at the top level", function() {
      expect(typeof thisResult.application).toEqual("object");
    });

    it("creates properties for application", function() {
      expect(thisResult.application.Name).toEqual("nameValue");
      expect(thisResult.application.CPU).toEqual("CPU Value");
    });

    it("creates a nested json document correctly", function() {
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

  describe("#validateSchema", function() {
    it("returns false for an invalid schema", function() {
      var result = SchemaUtil.validateSchema({ random: "properties" });
      expect(result).toEqual(false);
    });

    it("returns true for valid schema", function() {
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
