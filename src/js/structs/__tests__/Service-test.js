let HealthStatus = require('../../constants/HealthStatus');
let Service = require('../Service');

describe('Service', function () {

  describe('#getHealth', function () {

    it('returns NA health status', function () {
      let service = new Service();
      expect(service.getHealth()).toEqual(HealthStatus.NA);
    });

    it('returns correct health status', function () {
      let service = new Service({
        _meta: {marathon: {health: HealthStatus.HEALTHY}}
      });
      expect(service.getHealth()).toEqual(HealthStatus.HEALTHY);
    });

  });

  describe('#getResourceID', function () {

    it('returns the correct resource id when there is no name', function () {
      let service = new Service();
      expect(service.getResourceID()).toEqual('dcos:adminrouter:service:');
    });

    it('returns the correct resource id when there is a name', function () {
      let service = new Service({name: 'foo'});
      expect(service.getResourceID()).toEqual('dcos:adminrouter:service:foo');
    });

    it('returns the correct resource id when name is complex', function () {
      let service = new Service({name: 'foo-adsf-2'});
      expect(service.getResourceID())
        .toEqual('dcos:adminrouter:service:foo-adsf-2');
    });

  });

  describe('#getNodeIDs', function () {

    it('returns ids of nodes the service is running on', function () {
      let service = new Service({slave_ids: [1, 2, 3]});
      expect(service.getNodeIDs()).toEqual([1, 2, 3]);
    });

  });

  describe('#getUsageStats', function () {

    it('returns an object containing the value for the resource', function () {
      let service = new Service({used_resources: {cpus: 1, mem: 512}});
      expect(service.getUsageStats('cpus').value).toEqual(1);
      expect(service.getUsageStats('mem').value).toEqual(512);
    });

  });

});
