let TaskUtil = require('../TaskUtil');
let Service = require('../../structs/Service');

describe('TaskUtil', function () {

  describe('#getHostList', function () {

    it('returns empty array if ipAddresses and host is not set', function () {
      expect(TaskUtil.getHostList({})).toEqual([]);
    });

    it('prefers ipAddresses if both are defined', function () {
      expect(TaskUtil.getHostList({
        ipAddresses: [{ipAddress: 'foo'}, {ipAddress: 'bar'}],
        host: 'baz'
      })).toEqual(['foo', 'bar']);
    });

    it('returns host if ipAddresses is empty', function () {
      expect(TaskUtil.getHostList({ipAddresses: [], host: 'foo'}))
        .toEqual(['foo']);
    });

    it('returns an empty array if task is not defined', function () {
      expect(TaskUtil.getHostList()).toEqual([]);
    });

  });

  describe('#getPortList', function () {

    it('returns task ports if Service is not defined', function () {
      expect(TaskUtil.getPortList({ports: [1, 2]})).toEqual([1, 2]);
    });

    it('returns an empty array if neither are defined', function () {
      expect(TaskUtil.getPortList()).toEqual([]);
    });

    it('uses service ports if available', function () {
      let result = TaskUtil.getPortList(
        {},
        new Service({ipAddress: {discovery : {ports: [{number: 3}]}}})
      );

      expect(result).toEqual([3]);
    });

    it('prefers service ports if both are available', function () {
      let result = TaskUtil.getPortList(
        {ports: [1, 2]},
        new Service({ipAddress: {discovery : {ports: [{number: 3}]}}})
      );

      expect(result).toEqual([3]);
    });

  });

  describe('#getPortMappings', function () {

    beforeEach(function () {
      this.instance = TaskUtil.getPortMappings(
        {container: {type: 'FOO', foo: {port_mappings: ['foo', 'bar', 'baz']}}}
      );
    });

    it('should handle empty container well', function () {
      expect(TaskUtil.getPortMappings({}))
        .toEqual(null);
    });

    it('should handle empty type well', function () {
      expect(TaskUtil.getPortMappings({contianer: {}}))
        .toEqual(null);
    });

    it('should handle empty info well', function () {
      expect(TaskUtil.getPortMappings({contianer: {type: 'FOO'}}))
        .toEqual(null);
    });

    it('should handle empty port mappings well', function () {
      expect(TaskUtil.getPortMappings({contianer: {type: 'FOO', foo: {}}}))
        .toEqual(null);
    });

    it('should handle if port mappings are is not an array', function () {
      expect(TaskUtil.getPortMappings(
        {contianer: {type: 'FOO', foo: {port_mappings: 0}}}
      )).toEqual(null);
    });

    it('should provide port_mappings when available', function () {
      expect(this.instance).toEqual(['foo', 'bar', 'baz']);
    });

  });

});
