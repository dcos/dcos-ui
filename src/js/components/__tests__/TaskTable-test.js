jest.dontMock('./fixtures/MockTasks.json');
jest.dontMock('../../utils/ResourceTableUtil');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../TaskTable');
jest.dontMock('moment');

var React = require('react');
var ReactDOM = require('react-dom');

var MesosStateStore = require('../../stores/MesosStateStore');
var TaskTable = require('../TaskTable');
const Tasks = require('./fixtures/MockTasks.json').tasks;

describe('TaskTable', function () {
  beforeEach(function () {
    this.parentRouter = {
      getCurrentRoutes: function () {
        return [{name: 'home'}, {name: 'dashboard'}, {name: 'service-detail'}];
      }
    };
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <TaskTable tasks={Tasks} parentRouter={this.parentRouter} />,
      this.container
    );
  });

  afterEach(function () {
    MesosStateStore.getNodeFromID = this.getNodeFromID;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getTaskPanelRoute', function () {
    it('should be able to get the link to task detail', function () {
      var result = this.instance.getTaskPanelRoute();

      expect(result).toEqual('dashboard-task-panel');
    });
  });

  describe('#handleTaskClick', function () {
    it('should call transitionTo on parentRouter', function () {
      this.parentRouter.transitionTo = jasmine.createSpy();
      this.instance.handleTaskClick();

      expect(this.parentRouter.transitionTo).toHaveBeenCalled();
    });
  });
});
