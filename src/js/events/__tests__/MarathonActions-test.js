jest.dontMock('../AppDispatcher');
jest.dontMock('../UnitHealthActions');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
var Config = require('../../config/Config');
var MarathonActions = require('../MarathonActions');

describe('MarathonActions', function () {

  describe('#createGroup', function () {
    const newGroupId = 'test';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.createGroup({id: newGroupId});
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('sends data to the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/groups`);
    });

    it('uses POST for the request method', function () {
      expect(this.configuration.method).toEqual('POST');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MARATHON_GROUP_CREATE_SUCCESS);
      });

      this.configuration.success({
        'version': '2016-05-13T10:26:55.840Z',
        'deploymentId': '6119207e-a146-44b4-9c6f-0e4227dc04a5'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MARATHON_GROUP_CREATE_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#createService', function () {
    const appDefiniton = {
      id: '/test',
      cmd: 'sleep 100;'
    };

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.createService(appDefiniton);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('sends data to the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/apps`);
    });

    it('uses POST for the request method', function () {
      expect(this.configuration.method).toEqual('POST');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_SUCCESS);
      });

      this.configuration.success({
        'version': '2016-05-13T10:26:55.840Z',
        'deploymentId': '6119207e-a146-44b4-9c6f-0e4227dc04a5'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_MARATHON_SERVICE_CREATE_ERROR);
      });

      this.configuration.error({message: 'error', response: '{}'});
    });

  });

  describe('#fetchDeployments', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchDeployments();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/deployments`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_SUCCESS);
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: '/',
        version: '2001-01-01T01:01:01.001Z'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_DEPLOYMENTS_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#fetchGroups', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchGroups();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/groups`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_SUCCESS);
      });

      this.configuration.success({
        apps: [],
        dependencies: [],
        groups: [],
        id: '/',
        version: '2016-05-02T16:07:32.583Z'
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_GROUPS_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#fetchQueue', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchQueue();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/queue`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_SUCCESS);
      });

      this.configuration.success({
        queue: [
          {
            app: {
              id: '/service-id'
            },
            delay: {
              timeLeftSeconds: 0,
              overdue: true
            }
          }
        ]
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_MARATHON_QUEUE_ERROR);
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#fetchServiceVersion', function () {

    const serviceID = 'test';
    const versionID = '2016-05-02T16:07:32.583Z';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchServiceVersion(serviceID, versionID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(
        `${Config.rootUrl}/marathon/v2/apps/${serviceID}/versions/${versionID}`
      );
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_SUCCESS
        );
      });

      this.configuration.success({
        serviceID,
        versionID,
        versions: ['2016-05-02T16:07:32.583Z']
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSION_ERROR
        );
      });

      this.configuration.error({message: 'error'});
    });

  });

  describe('#fetchServiceVersions', function () {

    const serviceID = 'test';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      MarathonActions.fetchServiceVersions(serviceID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/marathon/v2/apps/${serviceID}/versions`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_SUCCESS
        );
      });

      this.configuration.success({
        serviceID,
        versions: ['2016-05-02T16:07:32.583Z']
      });
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_MARATHON_SERVICE_VERSIONS_ERROR
        );
      });

      this.configuration.error({message: 'error'});
    });

  });

});
