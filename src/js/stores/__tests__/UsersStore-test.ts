import UsersStore from "../UsersStore";
import AppDispatcher from "../../events/AppDispatcher";
import UsersList from "../../structs/UsersList";
import * as EventTypes from "../../constants/EventTypes";
import usersFixture from "./fixtures/users-unicode.json";

import { RequestUtil } from "mesosphere-shared-reactjs";
import * as ActionTypes from "../../constants/ActionTypes";
import Config from "#SRC/js/config/Config";

let thisRequestFn, thisUsersFixture, thisUseFixtures;

describe("UsersStore", () => {
  beforeEach(() => {
    thisRequestFn = RequestUtil.json;
    RequestUtil.json = handlers => {
      handlers.success(usersFixture);
    };
    thisUsersFixture = {
      ...usersFixture
    };
    thisUseFixtures = Config.useFixtures;
    Config.useFixtures = true;
  });

  afterEach(() => {
    RequestUtil.json = thisRequestFn;
    Config.useFixtures = thisUseFixtures;
  });

  it("returns an instance of UsersList", () => {
    UsersStore.fetchUsers();
    const users = UsersStore.getUsers();
    expect(users instanceof UsersList).toBeTruthy();
  });

  it("returns all of the users it was given", () => {
    UsersStore.fetchUsers();
    const users = UsersStore.getUsers().getItems();
    expect(users.length).toEqual(thisUsersFixture.array.length);
  });

  describe("dispatcher", () => {
    it("stores users when event is dispatched", () => {
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      const users = UsersStore.getUsers().getItems();
      expect(users[0].get("gid")).toEqual("foo");
      expect(users[0].get("bar")).toEqual("baz");
    });

    it("dispatches the correct event upon success", () => {
      const mockedFn = jest.fn();
      UsersStore.addChangeListener(EventTypes.USERS_CHANGE, mockedFn);
      AppDispatcher.handleServerAction({
        type: ActionTypes.REQUEST_USERS_SUCCESS,
        data: [{ gid: "foo", bar: "baz" }]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

    it("dispatches the correct event upon error", () => {
      const mockedFn = jasmine.createSpy();
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
