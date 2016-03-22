let Framework = require('../Framework');
let ServiceImages = require('../../constants/ServiceImages');

describe('Framework', function () {

  beforeEach(function () {
    this.instance = new Framework({
      labels: {
        DCOS_PACKAGE_METADATA: 'eyJuYW1lIjoic2VydmljZSIsImltYWdlcyI6eyJpY29u' +
        'LXNtYWxsIjoiaWNvbi1zZXJ2aWNlLXNtYWxsLnBuZyIsImljb24tbWVkaXVtIjoiaWN' +
        'vbi1zZXJ2aWNlLW1lZGl1bS5wbmciLCJpY29uLWxhcmdlIjoiaWNvbi1zZXJ2aWNlLW' +
        'xhcmdlLnBuZyJ9fQ=='
      }
    });
  });

  describe('#getImages', function () {

    it('defaults to NA images', function () {
      let framework = new Framework({});
      expect(framework.getImages()).toEqual(ServiceImages.NA_IMAGES);
    });

    it('get corrects images', function () {
      expect(this.instance.getImages()).toEqual({
        'icon-small': 'icon-service-small.png',
        'icon-medium': 'icon-service-medium.png',
        'icon-large': 'icon-service-large.png'
      });
    });

  });

  describe('#getMetadata', function () {

    it('defaults to empty object', function () {
      let framework = new Framework();
      expect(framework.getMetadata()).toEqual({});
    });

    it('returns correct metadata', function () {
      expect(this.instance.getMetadata()).toEqual({
        name: 'service',
        images: {
          'icon-small': 'icon-service-small.png',
          'icon-medium': 'icon-service-medium.png',
          'icon-large': 'icon-service-large.png'
        }
      });
    });

  });

  describe('#getNodeIDs', function () {

    it('returns ids of nodes the service is running on', function () {
      let framework = new Framework({slave_ids: [1, 2, 3]});
      expect(framework.getNodeIDs()).toEqual([1, 2, 3]);
    });

  });

  describe('#getResourceID', function () {

    it('returns the correct resource id when there is no name', function () {
      let framework = new Framework();
      expect(framework.getResourceID()).toEqual('dcos:adminrouter:service:');
    });

    it('returns the correct resource id when there is a name', function () {
      let framework = new Framework({name: 'foo'});
      expect(framework.getResourceID()).toEqual('dcos:adminrouter:service:foo');
    });

    it('returns the correct resource id when name is complex', function () {
      let framework = new Framework({name: 'foo-adsf-2'});
      expect(framework.getResourceID())
        .toEqual('dcos:adminrouter:service:foo-adsf-2');
    });

  });

  describe('#getUsageStats', function () {

    it('returns an object containing the value for the resource', function () {
      let framework = new Framework({used_resources: {cpus: 1, mem: 512}});
      expect(framework.getUsageStats('cpus').value).toEqual(1);
      expect(framework.getUsageStats('mem').value).toEqual(512);
    });

  });

  describe('#getWebURL', function () {

    it('returns the URL if it is present', function () {
      let service = new Service({webui_url: 'foo'});
      expect(service.getWebURL()).toEqual('foo');
    });

    it('returns null if the URL is not present', function () {
      let service = new Service({foo: 'bar'});
      expect(service.getWebURL()).toEqual(null);
    });

    it('returns null if the URL is an empty string', function () {
      let service = new Service({webui_url: ''});
      expect(service.getWebURL()).toEqual(null);
    });

  });

});
