jest.dontMock('../SystemLogActions');
jest.dontMock('../../events/AppDispatcher');
jest.dontMock('../../constants/ActionTypes');
jest.dontMock('../../utils/SystemLogUtil');
jest.dontMock('../../utils/CookieUtils');

const cookie = require('cookie');

const SystemLogActions = require('../SystemLogActions');
const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../../events/AppDispatcher');

const USER_COOKIE_KEY = 'dcos-acs-info-cookie';

describe('SystemLogActions', function () {

  beforeEach(function () {
    // Mock cookie
    this.cookieParse = cookie.parse;
    cookie.parse = function () {
      var cookieObj = {};
      cookieObj[USER_COOKIE_KEY] = 'aRandomCode';
      return cookieObj;
    };

    // Mock EventSource
    this.eventSource = new global.EventSource();
    spyOn(global, 'EventSource').and.returnValue(this.eventSource);
  });

  afterEach(function () {
    cookie.parse = this.cookieParse;
    this.eventSource.close();
  });

  describe('#subscribe', function () {

    beforeEach(function () {
      SystemLogActions.subscribe('foo', {cursor: 'bar', subscriptionID: 'subscriptionID'});
    });

    it('calls #addEventListener from the global.EventSource', function () {
      this.eventSource.addEventListener = jasmine.createSpy('addEventListener').and.callThrough();
      SystemLogActions.subscribe('foo', {cursor: 'bar'});
      expect(this.eventSource.addEventListener).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      let mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0])
        .toEqual('/system/v1/agent/foo/logs/v1/stream/?cursor=bar');
      expect(mostRecent.args[1]).toEqual({withCredentials: true});
    });

    it('sends without credentials when not available', function () {
      cookie.parse = function () {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = null;
        return cookieObj;
      };

      SystemLogActions.subscribe('foo', {cursor: 'bar'});
      let mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[1]).toEqual({withCredentials: false});
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_SYSTEM_LOG_SUCCESS);
      });

      let event = {
        data: '{}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('message', event);
    });

    it('dispatches the correct information when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({});
        expect(action.subscriptionID).toEqual('subscriptionID');
      });

      let event = {
        data: '{}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('message', event);
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type)
          .toEqual(ActionTypes.REQUEST_SYSTEM_LOG_ERROR);
      });

      this.eventSource.dispatchEvent('error', {});
    });

    it('dispatches the correct information when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({});
        expect(action.subscriptionID).toEqual('subscriptionID');
      });

      this.eventSource.dispatchEvent('error', {});
    });

  });

  describe('#unsubscribe', function () {

    beforeEach(function () {
      SystemLogActions.subscribe('foo', {cursor: 'bar', subscriptionID: 'subscriptionID'});
    });

    it('calls #close on the EventSource', function () {
      this.eventSource.close = jasmine.createSpy('close');
      SystemLogActions.unsubscribe('subscriptionID');
      expect(this.eventSource.close).toHaveBeenCalled();
    });

    it('unsubscribes event listeners on message', function () {
      this.messageSpy = jasmine.createSpy('message');
      this.eventSource.addEventListener('message', this.messageSpy);
      SystemLogActions.unsubscribe('subscriptionID');

      let event = {
        data: '{}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('message', event);

      expect(this.messageSpy).not.toHaveBeenCalled();
    });

  });

  describe('#fetchLogRange', function () {

    beforeEach(function () {
      SystemLogActions.fetchLogRange('foo', {cursor: 'bar', skip_prev: 10, subscriptionID: 'subscriptionID'});
    });

    it('calls #addEventListener from the EventSource', function () {
      this.eventSource.addEventListener = jasmine.createSpy('addEventListener').and.callThrough();
      SystemLogActions.fetchLogRange('foo', {cursor: 'bar'});
      expect(this.eventSource.addEventListener).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      let mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[0])
        .toEqual('/system/v1/agent/foo/logs/v1/range/?cursor=bar&skip_prev=10');
      expect(mostRecent.args[1]).toEqual({withCredentials: true});
    });

    it('sends without credentials when not available', function () {
      cookie.parse = function () {
        var cookieObj = {};
        cookieObj[USER_COOKIE_KEY] = null;
        return cookieObj;
      };

      SystemLogActions.fetchLogRange('foo', {cursor: 'bar'});
      let mostRecent = global.EventSource.calls.mostRecent();
      expect(mostRecent.args[1]).toEqual({withCredentials: false});
    });

    it('dispatches the correct action when closing connection', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_SYSTEM_LOG_SUCCESS
        );
      });

      let event = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('error', event);
    });

    it('dispatches the correct information when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.length).toEqual(3);
        expect(action.subscriptionID).toEqual('subscriptionID');
        expect(action.firstEntry).toEqual(false);
      });

      let messageEvent = {
        data: '{}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('message', messageEvent);
      this.eventSource.dispatchEvent('message', messageEvent);
      this.eventSource.dispatchEvent('message', messageEvent);
      let closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('error', closeEvent);
    });

    it('tells when the top has been reached', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data.length).toEqual(2);
        expect(action.subscriptionID).toEqual('subscriptionID');
        expect(action.firstEntry).toEqual(true);
      });

      let messageEvent = {
        data: '{}',
        eventPhase: global.EventSource.OPEN,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('message', messageEvent);
      this.eventSource.dispatchEvent('message', messageEvent);
      // Send same cursor
      this.eventSource.dispatchEvent(
        'message',
        Object.assign({}, messageEvent, {data: '{"cursor": "bar"}'})
      );
      let closeEvent = {
        data: {},
        eventPhase: global.EventSource.CLOSED,
        origin: global.location.origin
      };
      this.eventSource.dispatchEvent('error', closeEvent);
    });

    it('dispatches the correct action when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_PREVIOUS_SYSTEM_LOG_ERROR
        );
      });

      let event = {eventPhase: global.EventSource.CONNECTING};
      this.eventSource.dispatchEvent('error', event);
    });

    it('dispatches the correct information when unsuccessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.data).toEqual({eventPhase: global.EventSource.CONNECTING});
        expect(action.subscriptionID).toEqual('subscriptionID');
      });

      let event = {eventPhase: global.EventSource.CONNECTING};
      this.eventSource.dispatchEvent('error', event);
    });

  });

});
