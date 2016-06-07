jest.dontMock('../ServiceUtil');
jest.dontMock('../../structs/Service');

var Service = require('../../structs/Service');
var ServiceUtil = require('../ServiceUtil');

describe('ServiceUtil', function () {
  describe('#createServiceFromFormModel', function () {
    it('should convert to the correct Service', function () {
      let model = {
        general: {
          id: '/test',
          cmd: 'sleep 1000;'
        }
      };

      let expectedService = new Service({
        id: '/test',
        cmd: 'sleep 1000;'
      });

      expect(ServiceUtil.createServiceFromFormModel(model))
        .toEqual(expectedService);
    });

    it('should return empty service if null is provided', function () {
      let model = null;

      let expectedService = new Service({});

      expect(ServiceUtil.createServiceFromFormModel(model))
        .toEqual(expectedService);
    });

    it('should return empty service if empty object is provided', function () {
      let model = {};

      let expectedService = new Service({});

      expect(ServiceUtil.createServiceFromFormModel(model))
        .toEqual(expectedService);
    });
  });



  describe('#createFormModelFromSchema', function () {
    it('should create the correct model', function () {
      let schema = {
        type: 'object',
        properties: {
          General: {
            description: 'Configure your container',
            type: 'object',
            properties: {
              id: {
                default: '/service',
                title: 'ID',
                description: 'The id for the service',
                type: 'string',
                getter: function(service) {
                  return service.getId();
                }
              },
              cmd: {
                title: 'Command',
                default: 'sleep 1000;',
                description: 'The command which is executed by the service',
                type: 'string',
                multiLine: true,
                getter: function(service) {
                  return service.getCommand();
                }
              }
            }
          }
        },
        required: [
          'General'
        ]
      };

      let service = new Service({
        id: '/test',
        cmd: 'sleep 1000;'
      });

      expect(ServiceUtil.createFormModelFromSchema(schema, service)).toEqual({
        General: {
          id: '/test',
          cmd: 'sleep 1000;'
        }
      });
    });
  });

  describe('#getAppDefinitionFromService', function () {
    it('should create the correct appDefinition', function () {
      let service = new Service({
        id: '/test',
        cmd: 'sleep 1000;'
      });

      expect(ServiceUtil.getAppDefinitionFromService(service)).toEqual({
        id: '/test',
        cmd: 'sleep 1000;'
      });
    });
  });
});
