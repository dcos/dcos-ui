const RequestUtil = require("mesosphere-shared-reactjs").RequestUtil;

const UsersStore = require("../UsersStore");
const AppDispatcher = require("../../events/AppDispatcher");
const ActionTypes = require("../../constants/ActionTypes");
const EventTypes = require("../../constants/EventTypes");
const UsersList = require("../../structs/UsersList");
const Config = require("#SRC/js/config/Config").default;

const usersFixture = require("./fixtures/users-unicode.json");

let thisRequestFn, thisUsersFixture, thisUseFixtures;

describe("UsersStore", function() {
  beforeEach(function() {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = function(handlers) {
      handlers.success(usersFixture);
    };
    thisUsersFixture = Object.assign({}, usersFixture);
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;
  });

  afterEach(function() {
    RequestUtil.json = thisRequestFn;
    Config.useFixtures = thisUseFixtures;
  });

  it("returns an instance of UsersList", function() {
    UsersStore.fetchUsers();
    var users = UsersStore.getUsers();
    expect(users instanceof UsersList).toBeTruthy();
  });

  it("returns all of the users it was given", function() {
    UsersStore.fetchUsers();
    var users = UsersStore.getUsers().getItems();
    expect(users.length).toEqual(thisUsersFixture.array.length);
  });

  describe("dispatcher", function() {
    it("stores users when event is dispatched", function() {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      var users = UsersStore.getUsers().getItems();
      expect(users[0].get("gid")).toEqual("foo");
      expect(users[0].get("bar")).toEqual("baz");
    });

    it("dispatches the correct event upon success", function() {
      var mockedFn = jest.genMockFunction();
      UsersStore.addChangeListener(EventTypes.USERS_CHANGE, mockedFn);
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", function() {
      var mockedFn = jasmine.createSpy();
      UsersStore.addChangeListener(EventTypes.USERS_REQUEST_ERROR, mockedFn);
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_ERROR,
        data: "foo"
      });

      expect(mockedFn.calls.count()).toEqual(1);
      expect(mockedFn.calls.mostRecent().args).toEqual(["foo"]);
    });
  });
});
