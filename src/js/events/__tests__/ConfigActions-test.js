jest.dontMock('../AppDispatcher');
jest.dontMock('../../config/Config');
jest.dontMock('../../constants/ActionTypes');

const RequestUtil = require('mesosphere-shared-reactjs').RequestUtil;

const ActionTypes = require('../../constants/ActionTypes');
const AppDispatcher = require('../AppDispatcher');
const Config = require('../../config/Config');
const ConfigActions = require('../ConfigActions');

describe('ConfigActions', function () {

  describe('#fetchCCID', function () {

    const serviceID = 'test';

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      ConfigActions.fetchCCID(serviceID);
      this.configuration = RequestUtil.json.calls.mostRecent().args[0];
    });

    it('calls #json from the RequestUtil', function () {
      expect(RequestUtil.json).toHaveBeenCalled();
    });

    it('fetches data from the correct URL', function () {
      expect(this.configuration.url)
        .toEqual(`${Config.rootUrl}/navstar/lashup/key`);
    });

    it('dispatches the correct action when successful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_CLUSTER_CCID_SUCCESS
        );
        expect(action.data).toEqual({foo: 'bar', baz: 'qux'});
      });

      this.configuration.success({foo: 'bar', baz: 'qux'});
    });

    it('dispatches the correct action when unsucessful', function () {
      var id = AppDispatcher.register(function (payload) {
        var action = payload.action;
        AppDispatcher.unregister(id);
        expect(action.type).toEqual(
          ActionTypes.REQUEST_CLUSTER_CCID_ERROR
        );
      });

      this.configuration.error();
    });

  });

  describe('#fetchBootstrapConfig', function () {

    beforeEach(function () {
      spyOn(RequestUtil, 'json');
      ConfigActions.fetchBootstrapConfig();
      this.call = RequestUtil.json.calls.mostRecent();
    });

    it('fetches data from the metadata bootstrap config endpoint', function () {
      expect(RequestUtil.json).toHaveBeenCalledWith({
        url: `${Config.rootUrl}/dcos-metadata/bootstrap-config.json`,
        success: jasmine.any(Function),
        error: jasmine.any(Function)
      });
    });

    it('dispatches the appropriate action when successful', function () {
      const {success} = this.call.args[0];
      const id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action).toEqual({
          type: ActionTypes.REQUEST_BOOTSTRAP_CONFIG_SUCCESS,
          data: {foo: 'bar'}
        });
      });

      success({foo: 'bar'});
    });

    it('dispatches the appropriate action when unsuccessful', function () {
      const {error} = this.call.args[0];
      const id = AppDispatcher.register(function (payload) {
        AppDispatcher.unregister(id);
        expect(payload.action.type)
          .toEqual(ActionTypes.REQUEST_BOOTSTRAP_CONFIG_ERROR);
      });

      error();
    });

  });

});
