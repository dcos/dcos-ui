jest.dontMock('../MesosStateStore');

var MesosStateStore = require('../MesosStateStore');
var Task = require('../../structs/Task');

describe('MesosStateStore', function () {

  describe('#getTaskFromServiceName', function () {
    beforeEach(function () {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function () {
        return {
          frameworks: [{
            name: 'marathon',
            tasks: [1, 2, 3]
          }]
        };
      };
    });

    afterEach(function () {
      MesosStateStore.get = this.get;
    });

    it('should return tasks of service with name that matches', function () {
      var result = MesosStateStore.getTasksFromServiceName('marathon');
      expect(result).toEqual([1, 2, 3]);
    });

    it('should null if no service matches', function () {
      var result = MesosStateStore.getTasksFromServiceName('nonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('#getTasksByServiceId', function () {
    beforeEach(function () {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function () {
        return {
          frameworks: [
            {
              name: 'marathon',
              tasks: [
                {name: 'spark', id: 'spark.1'},
                {name: 'alpha', id: 'alpha.1'},
                {name: 'alpha', id: 'alpha.2'}
              ],
              completed_tasks: [
                {name: 'alpha', id: 'alpha.3'}
              ]
            },
            {
              name: 'spark',
              tasks: [
                {name: '1'},
                {name: '2'}
              ],
              completed_tasks: [
                {name: '3'}
              ]
            }
          ]
        };
      };
    });

    afterEach(function () {
      MesosStateStore.get = this.get;
    });

    it('should return matching framework tasks including scheduler tasks',
      function () {
        var tasks = MesosStateStore.getTasksByServiceId('/spark');
        expect(tasks).toEqual([
          {name: 'spark', id: 'spark.1'},
          {name: '1'},
          {name: '2'},
          {name: '3'}
        ]);
      }
    );

    it('should return matching application tasks', function () {
      var tasks = MesosStateStore.getTasksByServiceId('/alpha');
      expect(tasks).toEqual([
        {name: 'alpha', id: 'alpha.1'},
        {name: 'alpha', id: 'alpha.2'},
        {name: 'alpha', id: 'alpha.3'}
      ]);
    });

    it('should empty task list if no service matches', function () {
      var tasks = MesosStateStore.getTasksByServiceId('/non-existent');
      expect(tasks).toEqual([]);
    });
  });

  describe('#getNodeFromID', function () {
    beforeEach(function () {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function () {
        return {
          slaves: [{
            id: 'amazon-thing',
            fakeProp: 'fake'
          }]
        };
      };
    });

    afterEach(function () {
      MesosStateStore.get = this.get;
    });

    it('should return the node with the correct ID', function () {
      var result = MesosStateStore.getNodeFromID('amazon-thing');
      expect(result.fakeProp).toEqual('fake');
    });

    it('should return null if node not found', function () {
      var result = MesosStateStore.getNodeFromID('nonExistentNode');
      expect(result).toEqual(undefined);
    });
  });

  describe('#getTaskFromTaskID', function () {
    beforeEach(function () {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function () {
        return {
          frameworks: [{
            tasks: [{id: 1}],
            completed_tasks: [{id: 2}]
          }]
        };
      };
    });

    afterEach(function () {
      MesosStateStore.get = this.get;
    });

    it('should return an instance of Task', function () {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result instanceof Task).toBeTruthy();
    });

    it('should find a currently running task', function () {
      var result = MesosStateStore.getTaskFromTaskID(1);
      expect(result.get()).toEqual({id: 1})
    });

    it('should find a completed task', function () {
      var result = MesosStateStore.getTaskFromTaskID(2);
      expect(result.get()).toEqual({id: 2})
    });
  });

  describe('#getSchedulerTaskFromServiceName', function () {
    beforeEach(function () {
      this.get = MesosStateStore.get;
      MesosStateStore.get = function () {
        return {
          frameworks: [{
            name: 'marathon',
            tasks: [{
              id: 1,
              labels: [{key: 'DCOS_PACKAGE_FRAMEWORK_NAME', value: 'foo'}]
            }]
          }]
        };
      };
    });

    afterEach(function () {
      MesosStateStore.get = this.get;
    });

    it('should find a currently running task', function () {
      var result = MesosStateStore.getSchedulerTaskFromServiceName('foo');
      expect(result.id).toEqual(1);
    });

    it('shouldn\'t find a task', function () {
      var result = MesosStateStore.getSchedulerTaskFromServiceName('bar');
      expect(result).toEqual(undefined);
    });
  });
});
