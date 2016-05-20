jest.dontMock('../AppDispatcher');
jest.dontMock('../UsersActions');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

import {RequestUtil} from 'mesosphere-shared-reactjs';

let ActionTypes = require('../../constants/ActionTypes');
var AppDispatcher = require('../AppDispatcher');
let Config = require('../../config/Config');
let UsersActions = require('../UsersActions');

describe('UsersActions', function () {

  describe('#fetch', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UsersActions.fetch();
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_USERS_SUCCESS);
      });

      this.configuration.success({foo: 'bar'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(ActionTypes.REQUEST_USERS_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(Config.acsAPIPrefix + '/users');
    });

  });

  describe('#addUser', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UsersActions.addUser({uid: 'foo'});
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(Config.acsAPIPrefix + '/users/foo');
    });

    it('encodes characters for URL', function () {
      UsersActions.addUser({uid: 'foo@email.com'});
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(this.configuration.url).toEqual(Config.acsAPIPrefix + '/users/foo%40email.com');
    });

    it('uses PUT for the request method', function () {
      expect(this.configuration.method).toEqual('PUT');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_USER_CREATE_SUCCESS);
      });

      this.configuration.success({foo: 'bar'});
    });

    it('dispatches the userID when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.userID).toEqual('foo');
      });

      this.configuration.success({description: 'bar'});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_USER_CREATE_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct message when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the userID when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.userID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the xhr when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.xhr).toEqual({
          foo: 'bar',
          responseJSON: {description: 'baz'}
        });
      });

      this.configuration.error({
        foo: 'bar',
        responseJSON: {description: 'baz'}
      });
    });

  });

  describe('#deleteUser', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      UsersActions.deleteUser('foo');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url).toEqual(Config.acsAPIPrefix + '/users/foo');
    });

    it('encodes characters for URL', function () {
      UsersActions.deleteUser('foo@email.com');
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
      expect(this.configuration.url).toEqual(Config.acsAPIPrefix + '/users/foo%40email.com');
    });

    it('uses DELETE for the request method', function () {
      expect(this.configuration.method).toEqual('DELETE');
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_USER_DELETE_SUCCESS);
      });

      this.configuration.success({foo: 'bar'});
    });

    it('dispatches the userID when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.userID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_USER_DELETE_ERROR);
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the correct message when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual('bar');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

    it('dispatches the userID when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.userID).toEqual('foo');
      });

      this.configuration.error({responseJSON: {description: 'bar'}});
    });

  });

});
