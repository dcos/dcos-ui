jest.dontMock('../../stores/MesosSummaryStore');

let ApplicationUtil = require('../ApplicationUtil');
let Config = require('../../config/Config');
let EventTypes = require('../../constants/EventTypes');
let MesosSummaryStore = require('../../stores/MesosSummaryStore');

describe('ApplicationUtil', function () {

  describe('#invokeAfterPageLoad', function () {

    it('should call callback right away', function () {
      let spy = jest.fn();
      let now = Date.now();

      global.getPageLoadedTime = function () {
        return now - Config.applicationRenderDelay;
      }

      ApplicationUtil.invokeAfterPageLoad(spy);

      expect(setTimeout.mock.calls[0][0]).toEqual(spy);
      expect(setTimeout.mock.calls[0][1]).toEqual(undefined);
    });

    it('should call after time has elapsed', function () {
      let spy = jest.fn();
      let now = Date.now();

      global.getPageLoadedTime = function () {
        return now;
      }

      ApplicationUtil.invokeAfterPageLoad(spy);

      expect(setTimeout.mock.calls[0][0]).toEqual(spy);
      expect(setTimeout.mock.calls[0][1]).toEqual(1000);
    });

  });

  describe('#beginTemporaryPolling', function () {

    it('calls callback once event is emitted', function () {
      let spy = jest.fn();
      ApplicationUtil.beginTemporaryPolling(spy);
      expect(spy).not.toBeCalled();
      MesosSummaryStore.emit(EventTypes.MESOS_SUMMARY_CHANGE);
      expect(spy).toBeCalled();
    });

  });

});
