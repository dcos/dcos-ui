jest.dontMock('../ServiceConfigUtil');

const ServiceConfigUtil = require('../ServiceConfigUtil');

describe('ServiceConfigUtil', function () {
  describe('#getCommandString', function () {
    describe('pre-pods approach', function () {
      it('returns container command', function () {
        const container = {
          cmd: 'sleep 10'
        };

        expect(ServiceConfigUtil.getCommandString(container)).toEqual('sleep 10');
      });
    });

    describe('pods approach', function () {
      describe('shell command', function () {
        it('returns container command', function () {
          const container = {
            exec: {
              command: {
                shell: 'sleep 10'
              }
            }
          };
          expect(ServiceConfigUtil.getCommandString(container)).toEqual('sleep 10');
        });

      });

      describe('argv command', function () {
        it('returns container command', function () {
          const container = {
            exec: {
              command: {
                argv: ['sleep', '10']
              }
            }
          };
          expect(ServiceConfigUtil.getCommandString(container)).toEqual('sleep 10');
        });

      });

    });

  });

  describe('#getPortDefinitionGroups', function () {
    describe('port definitions with no name', function () {
      it('creates index-based headline', function () {
        const portDefinitions = [{}];
        const {headline} =
          ServiceConfigUtil.getPortDefinitionGroups(1, portDefinitions)[0];

        expect(headline).toEqual('Port Definition 1');
      });

    });

    describe('named port definitions', function () {
      it('adds the name to the headline', function () {
        const portDefinitions = [{
          name: 'portName'
        }];
        const {headline} =
          ServiceConfigUtil.getPortDefinitionGroups('1234', portDefinitions)[0];

        expect(headline).toEqual('Port Definition 1 (portName)');
      });

    });

    describe('load-balanced ports', function () {
      it('adds a service address to the definition', function () {
        const portDefinitions = [{
          port: 80,
          labels: {
            'VIP_0': '1.2.3.4:80'
          }
        }];
        const {hash} =
          ServiceConfigUtil.getPortDefinitionGroups('1234', portDefinitions)[0];

        expect(hash['Service Address'])
          .toEqual('1234.marathon.l4lb.thisdcos.directory:80');
      });

    });

    describe('generic ports', function () {
      it('doesn\'t add a service address to the definition', function () {
        const portDefinitions = [{
          port: 80,
          labels: {
            'SOME': 'LABEL'
          }
        }];
        const {hash} =
          ServiceConfigUtil.getPortDefinitionGroups('1234', portDefinitions)[0];

        expect(hash['Service Address']).toBeUndefined();
      });

    });

  });

});
