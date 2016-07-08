jest.dontMock('../CollapsingString');
jest.dontMock('./fixtures/MockTasks.json');
jest.dontMock('../../utils/ResourceTableUtil');
jest.dontMock('../../stores/MesosStateStore');
jest.dontMock('../TaskTable');
jest.dontMock('moment');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');
var JestUtil = require('../../utils/JestUtil');

var MesosStateStore = require('../../stores/MesosStateStore');
var TaskTable = require('../TaskTable');
const Tasks = require('./fixtures/MockTasks.json').tasks;

describe('TaskTable', function () {
  beforeEach(function () {
    this.parentRouter = {
      getCurrentRoutes: function () {
        return [{name: 'home'}, {name: 'dashboard'}, {name: 'service-detail'}];
      },
      getCurrentParams: function () {
        return [{nodeID: 'thing'}];
      }
    };

    this.container = document.createElement('div');

    this.instance = ReactDOM.render(
      JestUtil.stubRouterContext(
        TaskTable, {
          tasks: Tasks,
          parentRouter: this.parentRouter
        }
      ),
      this.container
    );

  });

  afterEach(function () {
    MesosStateStore.getNodeFromID = this.getNodeFromID;

    ReactDOM.unmountComponentAtNode(this.container);
  });

});
