jest.dontMock('../TaskDirectoryActions');
jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var TaskDirectoryActions = require('../TaskDirectoryActions');
var Config = require('../../config/Config');

describe('TaskDirectoryActions', function () {

  beforeEach(function () {
    this.configuration = null;
    this.requestUtilJSON = RequestUtil.json;
    RequestUtil.json = function (configuration) {
      this.configuration = configuration;
    }.bind(this);
    this.configRootUrl = Config.rootUrl;
    this.configUseFixtures = Config.useFixtures;
    Config.rootUrl = '';
    Config.useFixtures = false;
  });

  afterEach(function () {
    RequestUtil.json = this.requestUtilJSON;
    Config.rootUrl = this.configRootUrl;
    Config.useFixtures = this.configUseFixtures;
  });

  describe('#getInnerPath', function () {

    it('finds path of a running task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {frameworks: [{id: 'foo', executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a task in completed executors', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a task in completed frameworks', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

    it('finds path of a completed task with executor id', function () {
      var result = TaskDirectoryActions.getInnerPath(
        {completed_frameworks: [{id: 'foo', completed_executors: [{id: 'bar'}]}]},
        {framework_id: 'foo', executor_id: 'bar'}
      );

      expect(result).toBeTruthy();
    });

  });

});
