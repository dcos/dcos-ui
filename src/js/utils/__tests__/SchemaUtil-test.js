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
});
