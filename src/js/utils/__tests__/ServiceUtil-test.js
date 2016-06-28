jest.dontMock('../ServiceUtil');
jest.dontMock('../../structs/Service');
jest.dontMock('../../constants/VolumeConstants');

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

    describe('networking', function () {

      describe('host mode', function () {

        it('should not add a portDefinitions field if no ports were passed in', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            networking: {
              networkType: 'host',
              ports: []
            }
          });
          expect(service.portDefinitions).not.toBeDefined();
        });

        it('should convert the supplied network fields', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            networking: {
              networkType: 'host',
              ports: [ {protocol: 'udp', name: 'foo'} ]
            }
          });
          expect(service.portDefinitions).toEqual([
            {port: 0, protocol: 'udp', name: 'foo'}
          ]);
        });

        it('should enforce the port when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            networking: {
              networkType: 'host',
              ports: [ {lbPort: 1234, discovery: true} ]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(1234);
        });

        it('should override the port to 0 when discovery is off', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            networking: {
              networkType: 'host',
              ports: [ {lbPort: 1234, discovery: false} ]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(0);
        });

        it('should default the port to 0 when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            networking: {
              networkType: 'host',
              ports: [ {discovery: true} ]
            }
          });
          expect(service.portDefinitions[0].port).toEqual(0);
        });

        it('should add a VIP label when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
              general: { id: '/foo/bar'},
            networking: {
              networkType: 'host',
              ports: [ {lbPort: 1234, discovery: true} ]
            }
          });
          expect(service.portDefinitions[0].labels)
            .toEqual({VIP_0: '/foo/bar:1234'});
        });

        it('increments the VIP index', function () {
          let service = ServiceUtil.createServiceFromFormModel({
              general: { id: '/foo/bar'},
            networking: {
              networkType: 'host',
              ports: [
                {lbPort: 1234, discovery: true},
                {lbPort: 4321, discovery: true}
              ]
            }
          });
          expect(service.portDefinitions[1].labels)
            .toEqual({VIP_1: '/foo/bar:4321'});
        });

        describe('an empty networking ports member', function () {

          beforeEach(function () {
            let service = ServiceUtil.createServiceFromFormModel({
              networking: {
                networkType: 'host',
                ports: [{}]
              }
            });
            this.portDefinition = service.portDefinitions[0];
          });

          it('defaults port number to 0', function () {
            expect(this.portDefinition.port).toEqual(0);
          });

          it('defaults protocol to tcp', function () {
            expect(this.portDefinition.protocol).toEqual('tcp');
          });

          it('does not include a name by default', function () {
            expect(Object.keys(this.portDefinition)).not.toContain('name');
          });

          it('does not include labels by default', function () {
            expect(Object.keys(this.portDefinition)).not.toContain('labels');
          });

        });

      });

      describe('host mode (with docker)', function () {
        beforeEach(function () {
          this.service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'host',
              ports: [{}]
            }
          });
        });

        it('should add a portDefinitions field', function () {
          expect(this.service.portDefinitions).toBeDefined();
        });

        it('should not add a portMappings field to the docker definition',function () {
          expect(this.service.container.docker.portMappings).not.toBeDefined();
        });

        it('sets the docker network property correctly', function () {
          expect(this.service.container.docker.network).toEqual('HOST');
        });

      });

      describe('bridge mode (with docker)', function () {

        beforeEach(function () {
          this.serviceEmptyPorts = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: []
            }
          });
        });

        it('should not add a portMappings field if no ports were passed in', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: { networkType: 'bridge' }
          });
          expect(Object.keys(service.container.docker))
            .not.toContain('portMappings');
        });

        it('should not add a portDefinitions field to the app config', function () {
          expect(Object.keys(this.serviceEmptyPorts))
            .not.toContain('portDefinitions');
        });

        it('should convert the supplied string fields', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: [ { protocol: 'udp', name: 'foo' } ]
            }
          });
          expect(service.container.docker.portMappings).toEqual([
              {containerPort: 0, protocol: 'udp', name: 'foo'}
          ]);
        });

        it('should add the specified containerPort', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: [ { lbPort: 1234 } ]
            }
          });
          expect(service.container.docker.portMappings[0].containerPort)
            .toEqual(1234);
        });

        it('should not add a hostPort when discovery is off', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: [ { lbPort: 1234 } ]
            }
          });
          expect(Object.keys(service.container.docker.portMappings[0]))
            .not.toContain('hostPort');
        });

        it('should add both containerPort and hostPort when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: [ { lbPort: 1234, discovery: true } ]
            }
          });
          expect(service.container.docker.portMappings[0].hostPort).toEqual(1234);
        });

        it('should add a VIP label when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            general: { id: '/foo/bar' },
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'bridge',
              ports: [ { lbPort: 1234, discovery: true } ]
            }
          });
          expect(service.container.docker.portMappings[0].labels)
            .toEqual({VIP_0: '/foo/bar:1234'});
        });

        it('sets the docker network property correctly', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: { networkType: 'bridge' }
          });
          expect(service.container.docker.network).toEqual('BRIDGE');
        });

        describe('an empty networking ports member', function () {

          beforeEach(function () {
            let service = ServiceUtil.createServiceFromFormModel({
              containerSettings: { image: 'redis' },
              networking: {
                networkType: 'bridge',
                ports: [{}]
              }
            });
            this.portMapping = service.container.docker.portMappings[0];
          });

          it('defaults containerPort to 0', function () {
            expect(this.portMapping.containerPort).toEqual(0);
          });

          it('defaults protocol to tcp', function () {
            expect(this.portMapping.protocol).toEqual('tcp');
          });

          it('does not include a name by default', function () {
            expect(Object.keys(this.portMapping)).not.toContain('name');
          });

          it('does not include labels by default', function () {
            expect(Object.keys(this.portMapping)).not.toContain('labels');
          });

        });

      });

      describe('user mode', function () {
        it('sets the docker network property correctly', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: { networkType: 'prod' }
          });
          expect(service.container.docker.network).toEqual('USER');
        });

        it('adds the networkName field to the service', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: { networkType: 'user', ports: [{}] },
          });
          expect(service.ipAddress.networkName).toEqual('d-overlay-1');
        });

        it('should convert the supplied string fields', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'user',
              ports: [ { protocol: 'udp', name: 'foo' } ]
            }
          });
          expect(service.container.docker.portMappings).toEqual([
              {containerPort: 0, protocol: 'udp', name: 'foo'}
          ]);
        });

        it('should add the specified containerPort', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'user',
              ports: [ { lbPort: 1234 } ]
            }
          });
          expect(service.container.docker.portMappings[0].containerPort)
            .toEqual(1234);
        });

        it('should not add a servicePort when discovery is off', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'user',
              ports: [ { lbPort: 1234 } ]
            }
          });
          expect(Object.keys(service.container.docker.portMappings[0]))
            .not.toContain('servicePort');
        });

        it('should add a servicePort when discovery is on', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'user',
              ports: [ { lbPort: 1234, discovery: true } ]
            }
          });
          expect(service.container.docker.portMappings[0].servicePort)
            .toEqual(1234);
        });

        it('should not add a VIP label when discovery is off', function () {
          let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            networking: {
              networkType: 'user',
              ports: [ { lbPort: 1234 } ]
            }
          });
          expect(Object.keys(service.container.docker.portMappings[0]))
            .not.toContain('labels');
        });

        it('should add the appropriate VIP label when discovery is on', function () {
         let service = ServiceUtil.createServiceFromFormModel({
            containerSettings: { image: 'redis' },
            general: { id: '/foo/bar' },
            networking: {
              networkType: 'user',
              ports: [ { lbPort: 1234, discovery: true } ]
            }
          });
          expect(service.container.docker.portMappings[0].labels)
            .toEqual({VIP_0: '/foo/bar:1234'});
        });

        describe('an empty networking ports member', function () {

          beforeEach(function () {
            let service = ServiceUtil.createServiceFromFormModel({
              containerSettings: { image: 'redis' },
              networking: {
                networkType: 'user',
                ports: [{}]
              }
            });
            this.portMapping = service.container.docker.portMappings[0];
          });

          it('defaults containerPort to 0', function () {
            expect(this.portMapping.containerPort).toEqual(0);
          });

          it('defaults protocol to tcp', function () {
            expect(this.portMapping.protocol).toEqual('tcp');
          });

          it('does not include a name by default', function () {
            expect(Object.keys(this.portMapping)).not.toContain('name');
          });

          it('does not include labels by default', function () {
            expect(Object.keys(this.portMapping)).not.toContain('labels');
          });
        });

      });

    });

    describe('should return a service with', function() {
      it('local Volumes', function () {
        let model = {
          volumes: {
            localVolumes: [{
              containerPath: 'home',
              size: 10
            }]
          }
        };

        let expectedService = new Service({
          container: {
            type: 'MESOS',
            volumes: [{
              containerPath: 'home',
              persistent: {
                size: 10
              },
              mode: 'RW'
            }]
          },
          updateStrategy: {maximumOverCapacity: 0, minimumHealthCapacity: 0},
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: 'WAIT_FOREVER'
          }
        });

        expect(ServiceUtil.createServiceFromFormModel(model))
          .toEqual(expectedService);
      });

      it('local and docker Volumes', function () {
        let model = {
          containerSettings: {
            image: 'nginx'
          },
          volumes: {
            localVolumes: [{
              containerPath: 'home',
              size: 10
            }],
            dockerVolumes: [{
              containerPath: 'home',
              hostPath: 'home',
              mode: 'rw',
            }]
          }
        };

        let expectedService = new Service({
          container: {
            type: 'DOCKER',
            docker: {
              image: 'nginx'
            },
            volumes: [
              {
                containerPath: 'home',
                hostPath: 'home',
                mode: 'RW'
              },
              {
                containerPath: 'home',
                persistent: {
                  size: 10
                },
                mode: 'RW'
              }
            ]
          },
          updateStrategy: {maximumOverCapacity: 0, minimumHealthCapacity: 0},
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: 'WAIT_FOREVER'
          }
        });

        expect(ServiceUtil.createServiceFromFormModel(model))
          .toEqual(expectedService);
      });

      it('docker Volumes', function () {
        let model = {
          containerSettings: {
            image: 'nginx'
          },
          volumes: {
            dockerVolumes: [{
              containerPath: 'home',
              hostPath: 'home',
              mode: 'rw',
            }]
          }
        };

        let expectedService = new Service({
          container: {
            type: 'DOCKER',
            docker: {
              image: 'nginx'
            },
            volumes: [
              {
                containerPath: 'home',
                hostPath: 'home',
                mode: 'RW'
              }
            ]
          }
        });

        expect(ServiceUtil.createServiceFromFormModel(model))
          .toEqual(expectedService);
      });

      it('external Volumes', function () {
        let model = {
          volumes: {
            externalVolumes: [{
              containerPath: 'home',
              externalName: 'home'
            }]
          }
        };

        let expectedService = new Service({
          container: {
            type: 'MESOS',
            volumes: [
              {
                containerPath: 'home',
                external: {
                  name: 'home',
                  provider: 'dvdi',
                  options: {
                    'dvdi/driver': 'rexray'
                  }
                },
                mode: 'RW'
              }
            ]
          },
          updateStrategy: {maximumOverCapacity: 0, minimumHealthCapacity: 0}
        });

        expect(ServiceUtil.createServiceFromFormModel(model))
          .toEqual(expectedService);
      });
    })
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
                getter: function (service) {
                  return service.getId();
                }
              },
              cmd: {
                title: 'Command',
                default: 'sleep 1000;',
                description: 'The command which is executed by the service',
                type: 'string',
                multiLine: true,
                getter: function (service) {
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

  describe('#convertServiceLabelsToArray', function ()  {
    it('should return an array of key-value tuples', function () {
      let service = new Service({
        id: '/test',
        cmd: 'sleep 1000;',
        labels: {
          'label_one': 'value_one',
          'label_two': 'value_two'
        }
      });

      let serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(2);
      expect(serviceLabels).toEqual([
        {key: 'label_one', value: 'value_one'},
        {key: 'label_two', value: 'value_two'}
      ]);
    });

    it('should return an empty array if no labels are found', function () {
      let service = new Service({
        id: '/test',
        cmd: 'sleep 1000;'
      });

      let serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(0);
      expect(serviceLabels).toEqual([]);
    });

    it('only performs the conversion on a Service', function () {
      let service = {};
      let serviceLabels = ServiceUtil.convertServiceLabelsToArray(service);
      expect(serviceLabels.length).toEqual(0);
      expect(serviceLabels).toEqual([]);
    });
  });

});
