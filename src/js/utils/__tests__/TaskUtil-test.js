let TaskUtil = require('../TaskUtil');

describe('TaskUtil', function () {

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
