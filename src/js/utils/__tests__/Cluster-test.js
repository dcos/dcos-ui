jest.dontMock('../Cluster');

var Cluster = require('../Cluster');

describe('Cluster', function () {

  describe('#getServiceLink', function () {

    it('computes the url for the service null', function () {
      var serviceLink = Cluster.getServiceLink(null);
      expect(serviceLink).toEqual('/service/null/');
    });

    it('computes the url for a service with a string name', function () {
      var serviceLink = Cluster.getServiceLink('some-name');
      expect(serviceLink).toEqual('/service/some-name/');
    });

    it('computes the url for a service with a nested string name', function () {
      var serviceLink = Cluster.getServiceLink('some/nested/name');
      expect(serviceLink).toEqual('/service/some%2Fnested%2Fname/');
    });

  });

});
