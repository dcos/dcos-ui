import {
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR
} from '../constants/EventTypes';
import Config from '../config/Config';
import MesosSummaryStore from '../stores/MesosSummaryStore';

module.exports = {
  /**
   * Checks that enough time has elapsed before rendering app
   *
   * @param  {Func} onDelayEndCallback Gets called after delay has elapsed
   */
  invokeAfterPageLoad(onDelayEndCallback) {
    let timeSpentLoading = Date.now() - global.getPageLoadedTime();
    let msLeftOfDelay = Config.applicationRenderDelay - timeSpentLoading;

    if (msLeftOfDelay <= 0) {
      setTimeout(onDelayEndCallback);
    } else {
      setTimeout(onDelayEndCallback, msLeftOfDelay);
    }
  },

  /**
   * Polls mesos summary endpoint to ensure there's data before rendering
   *
   * @param  {Func} onSummaryReceivedCallback Called after summary request response
   */
  beginTemporaryPolling(onSummaryReceivedCallback) {
    let mesosEvents = [MESOS_SUMMARY_CHANGE, MESOS_SUMMARY_REQUEST_ERROR];

    MesosSummaryStore.init();

    function onMesosSummaryChange() {
      // Keep polling until the system attaches another listener to summary
      function keepPollingAlive() {
        if (MesosSummaryStore.listeners(MESOS_SUMMARY_CHANGE).length > 1) {
          MesosSummaryStore.removeChangeListener(
            MESOS_SUMMARY_CHANGE, keepPollingAlive
          );
        }
      }

      MesosSummaryStore.addChangeListener(
        MESOS_SUMMARY_CHANGE, keepPollingAlive
      );

      mesosEvents.forEach(function (event) {
        MesosSummaryStore.removeChangeListener(event, onMesosSummaryChange);
      });

      onSummaryReceivedCallback();
    }

    mesosEvents.forEach(function (event) {
      MesosSummaryStore.addChangeListener(event, onMesosSummaryChange);
    });
  }
};
