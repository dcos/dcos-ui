import Deployment from '../Deployment';
import ServicesList from '../ServicesList';

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

  describe('#getAffectedServices', function () {

    it('returns an empty ServiceList by default', function () {
      let deployment = new Deployment();
      let affectedServices = deployment.getAffectedServices();
      expect(affectedServices).toEqual(jasmine.any(ServicesList));
      expect(affectedServices.getItems()).toEqual([]);
    });

    it('throws an error if service IDs are set but services are not', function () {
      let deployment = new Deployment({affectedApps: ['app1', 'app2']});
      expect(deployment.getAffectedServices.bind(deployment)).toThrow();
    });

    it('returns the populated ServiceList if it is up-to-date', function () {
      let deployment = new Deployment({
        affectedApps: ['app1', 'app2'],
        affectedServices: new ServicesList({items: [
          {id: 'app1'}, {id: 'app2'}
        ]})
      });
      let affectedServices = deployment.getAffectedServices();
      expect(affectedServices).toEqual(jasmine.any(ServicesList));
      expect(affectedServices.getItems().length).toEqual(2);
    });
  });

});

