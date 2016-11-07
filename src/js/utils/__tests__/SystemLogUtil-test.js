jest.dontMock('../SystemLogUtil');

const SystemLogUtil = require('../SystemLogUtil');

describe('SystemLogUtil', function () {

  describe('#getUrl', function () {

    it('should include range element first in the url', function () {
      var result = SystemLogUtil.getUrl('foo', {cursor: 'cursor'});

      expect(result.indexOf('/foo/stream?cursor=cursor')).toBeGreaterThan(-1);
    });

    it('should encode value of range element', function () {
      var result = SystemLogUtil.getUrl('foo', {limit: 'lim&it'});

      expect(result.indexOf('?limit=lim%26it')).toBeGreaterThan(-1);
    });

    it('should concatenate range elements nicely together', function () {
      var result = SystemLogUtil.getUrl('foo', {
        cursor: 'cursor',
        limit: 'lim&it'
      });

      expect(result.indexOf('?cursor=cursor&limit=lim%26it')).toBeGreaterThan(-1);
    });

    it('should include filter after range element in the url', function () {
      var result = SystemLogUtil.getUrl('foo', {
        cursor: 'cursor',
        params: {param1: 'param1'}
      });

      expect(result.indexOf('/foo/stream?cursor=cursor&filter=param1:param1'))
        .toBeGreaterThan(-1);
    });

    it('should encode filter element', function () {
      var result = SystemLogUtil.getUrl(
        'foo',
        {params: {'param/1': 'param/1'}}
      );

      expect(result.indexOf('/foo/stream?filter=param%2F1:param%2F1'))
        .toBeGreaterThan(-1);
    });

    it('should concatenate range elements nicely together', function () {
      var result = SystemLogUtil.getUrl('foo', {
        cursor: 'cursor',
        limit: 'lim&it',
        params: {'param/1': 'param/1', 'param\\2': 'param\\2'}
      });

      expect(
        result.indexOf('?cursor=cursor&limit=lim%26it&filter=param%2F1:param%2F1&filter=param%5C2:param%5C2')
      ).toBeGreaterThan(-1);
    });

    it('ignores anything that is not a param or filter', function () {
      var result = SystemLogUtil.getUrl('foo', {
        bar: 'bar'
      });

      expect(result.indexOf('bar')).toBe(-1);
    });

    it('should use stream by default', function () {
      var result = SystemLogUtil.getUrl('foo', {
        cursor: 'cursor',
        params: {'param/1': 'param/1'}
      });

      expect(result.indexOf('/stream')).toBeGreaterThan(-1);
    });

    it('should use logs', function () {
      var result = SystemLogUtil.getUrl('foo', {
        cursor: 'cursor',
        params: {'param/1': 'param/1'}
      }, false);

      expect(result.indexOf('/logs')).toBeGreaterThan(-1);
    });

  });

});
