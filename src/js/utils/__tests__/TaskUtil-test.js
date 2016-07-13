jest.dontMock('../../stores/MarathonStore');

let MarathonStore = require('../../stores/MarathonStore');
let TaskUtil = require('../TaskUtil');

describe('TaskUtil', function () {

  describe('#getTaskEndpoints', function () {

    beforeEach(function () {
      this.MarathonStoreGetServiceFromTaskID = MarathonStore.getServiceFromTaskID;
      MarathonStore.getServiceFromTaskID = function () { return null; };
    });

    afterEach(function () {
      MarathonStore.getServiceFromTaskID = this.MarathonStoreGetServiceFromTaskID;
    });

    it('should return an array of hosts and ports', function () {
      let endpoints = TaskUtil.getTaskEndpoints(
        {ports: [0, 1, 2, 3], host: '0.0.0.1'}
      );

      expect(endpoints.hosts).toEqual(['0.0.0.1']);
      expect(endpoints.ports).toEqual([0, 1, 2, 3]);
    });

    it('should return empty arrays for ports and host if the task is undefined',
      function () {
      let endpoints = TaskUtil.getTaskEndpoints();

      expect(endpoints.hosts).toEqual([]);
      expect(endpoints.ports).toEqual([]);
    });

    it('should return empty arrays for ports and host if the ports and ' +
      'ipAddresses values are undefined', function () {
      let endpoints = TaskUtil.getTaskEndpoints({foo: 'bar'});

      expect(endpoints.hosts).toEqual([]);
      expect(endpoints.ports).toEqual([]);
    });

    it('should return empty arrays for ports and host if the ports and ' +
      'ipAddresses values are arrays of length 0', function () {
      let endpoints = TaskUtil.getTaskEndpoints({ports: [], ipAddresses: []});

      expect(endpoints.hosts).toEqual([]);
      expect(endpoints.ports).toEqual([]);
    });

    it('should return an empty array for ports if ports are undefined',
      function () {
      let endpoints = TaskUtil.getTaskEndpoints({foo: 'bar'});

      expect(endpoints.hosts).toEqual([]);
      expect(endpoints.ports).toEqual([]);
    });

    it('should return an array of hosts as defined by the ipAddresses key on ' +
      ' the task and ports as defined by a service', function () {
      MarathonStore.getServiceFromTaskID = function () {
        return {
          ipAddress: {
            discovery: {
              ports: [0, 1, 2, 3]
            }
          }
        };
      };

      let endpoints = TaskUtil.getTaskEndpoints({
        ports: [0],
        ipAddresses: ['0.0.0.1']
      });

      expect(endpoints.hosts).toEqual(['0.0.0.1']);
      expect(endpoints.ports).toEqual([0, 1, 2, 3]);
    });

    it('should fallback to an array of hosts and ports as defined on a task ' +
      'if the service does not return ports',
      function () {
      MarathonStore.getServiceFromTaskID = function () {
        return {
          ipAddress: {
            discovery: {}
          }
        };
      };

      let endpoints = TaskUtil.getTaskEndpoints({
        host: '0.0.0.1',
        ports: [0],
        ipAddresses: ['0.0.0.2']
      });

      expect(endpoints.hosts).toEqual(['0.0.0.1']);
      expect(endpoints.ports).toEqual([0]);
    });

    it('should fallback to an array of hosts and ports as defined on a task ' +
      'if the service does not return discovery',
      function () {
      MarathonStore.getServiceFromTaskID = function () {
        return {
          ipAddress: {}
        };
      };

      let endpoints = TaskUtil.getTaskEndpoints({
        host: '0.0.0.1',
        ports: [0],
        ipAddresses: ['0.0.0.2']
      });

      expect(endpoints.hosts).toEqual(['0.0.0.1']);
      expect(endpoints.ports).toEqual([0]);
    });

    it('should fallback to an array of hosts and ports as defined on a task ' +
      'if the service does not return ipAddress',
      function () {
      MarathonStore.getServiceFromTaskID = function () { return {}; };

      let endpoints = TaskUtil.getTaskEndpoints({
        host: '0.0.0.1',
        ports: [0],
        ipAddresses: ['0.0.0.2']
      });

      expect(endpoints.hosts).toEqual(['0.0.0.1']);
      expect(endpoints.ports).toEqual([0]);
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
