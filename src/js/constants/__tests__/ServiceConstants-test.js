var ServiceConstants = require('../ServiceConstants');

describe('ServiceConstants', function () {

  describe('regexp', function () {

    var regexp = ServiceConstants.SERVICE_RESOURCE_ID_REGEXP;

    it('validates service name', function () {
      expect(regexp.test('dcos:adminrouter:service:marathon')).toBeTruthy();
    });

    it('validates service with dashes', function () {
      expect(regexp.test('dcos:adminrouter:service:marathon-user')).toBeTruthy();
    });

    it('fails with invalid service id', function () {
      expect(regexp.test('dcos:adminrouter:service:marathon/user')).toBeFalsy();
    });

    it('fails with invalid resource id', function () {
      expect(regexp.test('dcos:service:marathon:foo/bar')).toBeFalsy();
    });

  });

});
