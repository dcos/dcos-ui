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

});
