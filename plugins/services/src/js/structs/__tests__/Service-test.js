const Service = require('../Service');
const ServiceConfig = require('../../constants/ServiceConfig');

describe('Service', function () {

  describe('#getId', function () {

    it('returns correct id', function () {
      const service = new Service({
        id: '/test/cmd'
      });

      expect(service.getId()).toEqual('/test/cmd');
    });

  });

  describe('#getMesosId', function () {

    it('returns correct id', function () {
      const service = new Service({
        id: '/test/cmd'
      });

      expect(service.getMesosId()).toEqual('cmd.test');
    });

  });

  describe('#toJSON', function () {

    it('returns a object with the values in _itemData', function () {
      const item = new Service({foo: 'bar', baz: 'qux'});
      expect(item.toJSON()).toEqual({foo:'bar', baz:'qux'});
    });

    it('returns a JSON string with the values in _itemData', function () {
      const item = new Service({foo: 'bar', baz: 'qux'});
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });

    ServiceConfig.BLACKLIST.forEach(function (blacklistedKey) {

      it(`should drop blacklisted key '${blacklistedKey}'`, function () {
        const item = new Service({foo: 'bar', baz: 'qux', [blacklistedKey]: []});
        expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
      });

    });

  });

});
