const MesosStateUtil = require('../MesosStateUtil');

describe('MesosStateUtil', function () {

  describe('#flagMarathonTasks', function () {
    it('should assign a isStartedByMarathon flag to all tasks', function () {
      const state = {
        frameworks: [
          {
            name: 'marathon',
            tasks: [
              {name: 'spark', id: 'spark.1'},
              {name: 'alpha', id: 'alpha.1'}
            ],
            completed_tasks: [
              {name: 'alpha', id: 'alpha.2'}
            ]
          },
          {
            name: 'spark',
            tasks: [
              {name: '1'}
            ],
            completed_tasks: [
              {name: '2'}
            ]
          }
        ]
      };

      expect(MesosStateUtil.flagMarathonTasks(state)).toEqual({frameworks: [
        {
          name: 'marathon',
          tasks: [
            {name: 'spark', id: 'spark.1', isStartedByMarathon: true},
            {name: 'alpha', id: 'alpha.1', isStartedByMarathon: true}
          ],
          completed_tasks: [
            {name: 'alpha', id: 'alpha.2', isStartedByMarathon: true}
          ]
        },
        {
          name: 'spark',
          tasks: [
            {name: '1', isStartedByMarathon: false}
          ],
          completed_tasks: [
            {name: '2', isStartedByMarathon: false}
          ]
        }
      ]});
    });

  });

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
        MesosStateUtil.getTasksFromVirtualNetworkName(null, 'foo');
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
