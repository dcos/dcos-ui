let MesosStateUtil = require('../MesosStateUtil');

describe('MesosStateUtil', function () {

  describe('#getTasksFromVirtualNetworkName', function () {

    beforeEach(function () {
      this.instance = MesosStateUtil.getTasksFromVirtualNetworkName(
        {frameworks: [
          {id: 'foo'},
          {id: 'bar'},
          {id: 'baz', tasks: [{container: {network_infos:[{name: 'alpha'}]}}]},
          {id: 'qux', tasks: [
            {container: {network_infos:[{name: 'alpha'}]}},
            {container: {network_infos:[{name: 'beta'}]}}
          ]}
        ]},
        'alpha'
      );
    });

    it('should handle empty object well', function () {
      expect(MesosStateUtil.getTasksFromVirtualNetworkName({}, 'foo'))
        .toEqual([]);
    });

    it('should throw when a null state is provided', function () {
      expect(function () {
        MesosStateUtil.getTasksFromVirtualNetworkName(null, 'foo')
      }).toThrow();
    });

    it('should handle empty undefined well', function () {
      expect(MesosStateUtil.getTasksFromVirtualNetworkName(undefined, 'foo'))
        .toEqual([]);
    });

    it('should filter tasks that doesn\'t have the overlay name', function () {
      expect(this.instance.length).toEqual(2);
    });

    it('should find tasks from different frameworks', function () {
      expect(this.instance).toEqual([
        {container: {network_infos:[{name: 'alpha'}]}},
        {container: {network_infos:[{name: 'alpha'}]}}
      ]);
    });

  });

});
