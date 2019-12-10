import {
  MESOS_SUMMARY_CHANGE,
  MESOS_SUMMARY_REQUEST_ERROR
} from "../constants/EventTypes";
import MesosSummaryStore from "../stores/MesosSummaryStore";

export default {
  /**
   * Polls mesos summary endpoint to ensure there's data before rendering
   *
   * @param  {Func} onSummaryReceivedCallback Called after summary request response
   */
  beginTemporaryPolling(onSummaryReceivedCallback) {
    const mesosEvents = [MESOS_SUMMARY_CHANGE, MESOS_SUMMARY_REQUEST_ERROR];

    MesosSummaryStore.init();

    function onMesosSummaryChange() {
      // Keep polling until the system attaches another listener to summary
      function keepPollingAlive() {
        if (MesosSummaryStore.listeners(MESOS_SUMMARY_CHANGE).length > 1) {
          MesosSummaryStore.removeChangeListener(
            MESOS_SUMMARY_CHANGE,
            keepPollingAlive
          );
        }
      }

      MesosSummaryStore.addChangeListener(
        MESOS_SUMMARY_CHANGE,
        keepPollingAlive
      );

      mesosEvents.forEach(event => {
        MesosSummaryStore.removeChangeListener(event, onMesosSummaryChange);
      });

      onSummaryReceivedCallback();
    }

    mesosEvents.forEach(event => {
      MesosSummaryStore.addChangeListener(event, onMesosSummaryChange);
    });
  }
};
