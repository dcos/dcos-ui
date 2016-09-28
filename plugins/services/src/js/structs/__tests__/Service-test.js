const Service = require('../Service');

describe('Service', function () {

  describe('#getId', function () {

    it('returns correct id', function () {
      let service = new Service({
        id: '/test/cmd'
      });

      expect(service.getId()).toEqual('/test/cmd');
    });

  });

  describe('#getMesosId', function () {

    it('returns correct id', function () {
      let service = new Service({
        id: '/test/cmd'
      });

      expect(service.getMesosId()).toEqual('cmd.test');
    });

  });

  describe('#toJSON', function () {

    it('returns a object with the values in _itemData', function () {
      let item = new Service({foo: 'bar', baz: 'qux'});
      expect(item.toJSON()).toEqual({foo:'bar', baz:'qux'});
    });

    it('returns a JSON string with the values in _itemData', function () {
      let item = new Service({foo: 'bar', baz: 'qux'});
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });

    it('should drop blacklisted keys', function () {
      let item = new Service({foo: 'bar', baz: 'qux', uris: []});
      expect(JSON.stringify(item)).toEqual('{"foo":"bar","baz":"qux"}');
    });

  });

});
