let Deployment = require('../Deployment');

describe('Deployment', function () {

  describe('#get...', function () {
    it('calls through to `Item.get`', function () {
      let deployment = new Deployment({
        id: 'deployment-id',
        version: '2001-01-01T01:01:01.001Z',
        affectedApps: ['app1', 'app2'],
        currentStep: 2,
        totalSteps: 3
      });
      expect(deployment.getId()).toEqual('deployment-id');
      expect(deployment.getAffectedServiceIds())
        .toEqual(['app1', 'app2']);
      expect(deployment.getCurrentStep()).toEqual(2);
      expect(deployment.getTotalSteps()).toEqual(3);
    });
  });

  describe('#getStartTime', function () {
    it('returns a Date object derived from the version property', function () {
      let version = '2001-01-01T01:01:01.001Z';
      let deployment = new Deployment({version});
      expect(deployment.getStartTime()).toEqual(jasmine.any(Date));
      expect(deployment.getStartTime().toISOString()).toEqual(version);
    });
  });

});

