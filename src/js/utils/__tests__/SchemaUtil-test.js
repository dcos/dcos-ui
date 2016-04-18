jest.dontMock('../SchemaUtil');

var SchemaUtil = require('../SchemaUtil');

describe('SchemaUtil', function () {
  describe('#schemaToMultipleDefinition', function () {
    describe('not nested schema', function () {
      beforeEach(function () {
        var schema = {
          properties: {
            application: {
              description: 'This is a description',
              properties: {
                id: {
                  type: 'string'
                }
              }
            }
          }
        };

        this.subheaderRender = jasmine.createSpy();
        this.result = SchemaUtil.schemaToMultipleDefinition(
          schema, this.subheaderRender
        );
      });

      it('sets the title of the definition', function () {
        expect(this.result.application.title).toEqual('application');
      });

      it('creates a field for the property', function () {
        expect(this.result.application).toNotEqual(undefined);
      });

      it('sets the title correctly', function () {
        expect(this.result.application.title).toEqual('application');
      });

      it('turns a schema to a definition', function () {
        expect(this.result.application.description)
          .toEqual('This is a description');
      });

      it('creates a definition for the field', function () {
        expect(Array.isArray(this.result.application.definition)).toEqual(true);
      });

      it('does not call subheaderRender because schema is flat', function () {
        expect(this.subheaderRender).not.toHaveBeenCalled();
      });
    });

    describe('nested schema', function () {
      beforeEach(function () {
        var schema = {
          properties: {
            application: {
              description: 'This is a description',
              properties: {
                id: {
                  properties: {
                    name: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        };

        this.subheaderRender = jasmine.createSpy();
        this.result = SchemaUtil.schemaToMultipleDefinition(
          schema, this.subheaderRender
        );
      });

      it('creates a nested definition correctly', function () {
        expect(this.result.application.definition[0].definition)
          .toNotEqual(undefined);
      });

      it('creates render property with a render function', function () {
        expect(typeof this.result.application.definition[0].render)
          .toEqual('function');
      });
    });
  });

  describe('#definitionToJSONDocument', function () {
    beforeEach(function () {
      var definition = {
        application: {
          title: 'Application',
          description: 'Lorem ipsum dolor sit amet',
          definition: [
            {
              fieldType: 'text',
              name: 'Name',
              placeholder: 'Name',
              required: false,
              showError: false,
              showLabel: true,
              writeType: 'input',
              validation: function () { return true; },
              value: 'nameValue'
            },
            {
              fieldType: 'text',
              name: 'CPU',
              placeholder: 'CPU',
              required: false,
              showError: false,
              showLabel: true,
              writeType: 'input',
              validation: function () { return true; },
              value: 'CPU Value'
            }
          ]
        }
      };

      this.result = SchemaUtil.definitionToJSONDocument(definition);
    });

    it('creates Application at the top level', function () {
      expect(typeof this.result.application).toEqual('object');
    });

    it('creates properties for application', function () {
      expect(this.result.application.Name).toEqual('nameValue');
      expect(this.result.application.CPU).toEqual('CPU Value');
    });

    it('creates a nested json document correctly', function () {
      var definition = {
        application: {
          title: 'Application',
          description: 'Lorem ipsum dolor sit amet',
          definition: [
            {
              name: 'Nested',
              definition: [
                {
                  fieldType: 'text',
                  name: 'CPU',
                  placeholder: 'CPU',
                  required: false,
                  showError: false,
                  showLabel: true,
                  writeType: 'input',
                  validation: function () { return true; },
                  value: 'CPU Value'
                }
              ]
            }
          ]
        }
      };

      var result = SchemaUtil.definitionToJSONDocument(definition);
      expect(result.application.Nested.CPU).toEqual('CPU Value');
    });
  });

  describe('#validateSchema', function () {
    it('should return false for an invalid schema', function () {
      var result = SchemaUtil.validateSchema({random: 'properties'});
      expect(result).toEqual(false);
    });

    it('should return true for valid schema', function () {
      var schema = {
        properties: {
          application: {
            description: 'This is a description',
            properties: {
              id: {
                properties: {
                  name: {
                    type: 'string'
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
