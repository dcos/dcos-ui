jest.dontMock("../UserStore");
jest.dontMock("../../events/UsersActions");

const UserStore = require("../UserStore");
const ActionTypes = require("../../constants/ActionTypes");
const AppDispatcher = require("../../events/AppDispatcher");
const EventTypes = require("../../constants/EventTypes");

describe("UserStore", function() {
  describe("dispatcher", function() {
    afterEach(function() {
      UserStore.removeAllListeners();
    });

    describe("create", function() {
      it("emits event after success event is dispatched", function() {
        UserStore.addChangeListener(EventTypes.USER_CREATE_SUCCESS, function() {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_SUCCESS
        });
      });

      it("emits success event with the userID", function() {
        UserStore.addChangeListener(EventTypes.USER_CREATE_SUCCESS, function(
          userID
        ) {
          expect(userID).toEqual("foo");
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_SUCCESS,
          userID: "foo"
        });
      });

      it("emits event after error event is dispatched", function() {
        UserStore.addChangeListener(EventTypes.USER_CREATE_ERROR, function() {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR
        });
      });

      it("emits success event with the userID", function() {
        UserStore.addChangeListener(EventTypes.USER_CREATE_ERROR, function(
          errorMsg,
          userID
        ) {
          expect(userID).toEqual("foo");
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR,
          userID: "foo"
        });
      });

      it("emits success event with the xhr", function() {
        UserStore.addChangeListener(EventTypes.USER_CREATE_ERROR, function(
          errorMsg,
          userID,
          xhr
        ) {
          expect(xhr).toEqual({ foo: "bar" });
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_CREATE_ERROR,
          userID: "foo",
          xhr: { foo: "bar" }
        });
      });
    });

    describe("delete", function() {
      it("emits event after success event is dispatched", function() {
        UserStore.addChangeListener(EventTypes.USER_DELETE_SUCCESS, function() {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_SUCCESS
        });
      });

      it("emits success event with the userID", function() {
        UserStore.addChangeListener(EventTypes.USER_DELETE_SUCCESS, function(
          userID
        ) {
          expect(userID).toEqual("foo");
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_SUCCESS,
          userID: "foo"
        });
      });

      it("emits event after error event is dispatched", function() {
        UserStore.addChangeListener(EventTypes.USER_DELETE_ERROR, function() {
          expect(true).toEqual(true);
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_ERROR
        });
      });

      it("emits error event with the userID and error", function() {
        UserStore.addChangeListener(EventTypes.USER_DELETE_ERROR, function(
          error,
          userID
        ) {
          expect(userID).toEqual("foo");
          expect(error).toEqual("error");
        });

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_USER_DELETE_ERROR,
          userID: "foo",
          data: "error"
        });
      });
    });
  });
});
