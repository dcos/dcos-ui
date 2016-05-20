jest.dontMock('../UsersStore');
jest.dontMock('../../mixins/GetSetMixin');
jest.dontMock('../../../../tests/_fixtures/acl/users-unicode.json');

import {RequestUtil} from 'mesosphere-shared-reactjs';

var UsersStore = require('../UsersStore');
var AppDispatcher = require('../../events/AppDispatcher');
var ActionTypes = require('../../constants/ActionTypes');
var EventTypes = require('../../constants/EventTypes');
var UsersList = require('../../structs/UsersList');
var Config = require('../../config/Config');

var usersFixture = require('../../../../tests/_fixtures/acl/users-unicode.json');

describe('UsersStore', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function (handlers) {
      handlers.success(usersFixture);
    };
    this.usersFixture = Object.assign({}, usersFixture);
    this.useFixtures = Config.useFixtures;
    Config.useFixtures = true;
  });

  afterEach(function () {
    RequestUtil.json = this.requestFn;
    Config.useFixtures = this.useFixtures;
  });

  it('should return an instance of UsersList', function () {
    UsersStore.fetchUsers();
    var users = UsersStore.getUsers();
    expect(users instanceof UsersList).toBeTruthy();
  });

  it('should return all of the users it was given', function () {
    UsersStore.fetchUsers();
    var users = UsersStore.getUsers().getItems();
    expect(users.length).toEqual(this.usersFixture.array.length);
  });

  describe('dispatcher', function () {

    it('stores users when event is dispatched', function () {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{gid: 'foo', bar: 'baz'}]
      });

      var users = UsersStore.getUsers().getItems();
      expect(users[0].get('gid')).toEqual('foo');
      expect(users[0].get('bar')).toEqual('baz');
    });

    it('dispatches the correct event upon success', function () {
      var mockedFn = jest.genMockFunction();
      UsersStore.addChangeListener(EventTypes.USERS_CHANGE, mockedFn);
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{gid: 'foo', bar: 'baz'}]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it('dispatches the correct event upon error', function () {
      var mockedFn = jasmine.createSpy();
      UsersStore.addChangeListener(
        EventTypes.USERS_REQUEST_ERROR,
        mockedFn
      );
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_ERROR,
        data: 'foo'
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(['foo']);
    });

  });

});
