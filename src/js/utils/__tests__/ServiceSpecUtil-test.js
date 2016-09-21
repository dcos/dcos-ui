jest.dontMock('../ServiceSpecUtil');
jest.dontMock('../../structs/PodSpec');

const PodSpec = require('../../structs/PodSpec');
const ServiceSpecUtil = require('../ServiceSpecUtil');

describe('ServiceSpecUtil', function () {

  describe('Pods', function () {

    describe('#setFixedScaling', function () {

      it('should properly create missing sections', function () {
        var spec = new PodSpec({ });
        var newSpec = ServiceSpecUtil.setFixedScaling(spec, 10);
        expect(newSpec.scaling).toEqual({
          kind: 'fixed',
          instances: 10
        });
      });

      it('should keep existing fields intact', function () {
        var spec = new PodSpec({
          scaling: {
            kind: 'fixed',
            instances: 1,
            maxInstances: 50
          }
        });
        var newSpec = ServiceSpecUtil.setFixedScaling(spec, 10);
        expect(newSpec.scaling).toEqual({
          kind: 'fixed',
          instances: 10,
          maxInstances: 50
        });
      });

      it('should properly reset to fixed on different scale kind', function () {
        var spec = new PodSpec({
          scaling: {
            kind: 'different',
            instances: 50,
            miscFieldThatWillBeDropped: ':('
          }
        });
        var newSpec = ServiceSpecUtil.setFixedScaling(spec, 10);
        expect(newSpec.scaling).toEqual({
          kind: 'fixed',
          instances: 10
        });
      });

    });

  });

});
