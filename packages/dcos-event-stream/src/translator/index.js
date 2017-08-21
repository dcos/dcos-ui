import Rx from "rxjs/Rx";
import translateSubscribed from "./TranslatorSubscribed";
import translateTaskAdded from "./TranslatorTaskAdded";
import translateTaskUpdated from "./TranslatorTaskUpdated";
import translateAgentAdded from "./TranslatorAgentAdded";
import translateAgentRemoved from "./TranslatorAgentRemoved";
import translateFrameworkAdded from "./TranslatorFrameworkAdded";
import translateFrameworkUpdated from "./TranslatorFrameworkUpdated";
import translateFrameworkRemoved from "./TranslatorFrameworkRemoved";

import apiClient from "../MesosOperatorApiClient";
import MesosOperatorEventTypes from "../constants/MesosOperatorEventTypes";

const stream = new Rx.ReplaySubject();

const translateEvent = function(event) {
  switch (event.type) {
    case MesosOperatorEventTypes.SUBSCRIBED:
      stream.next(translateSubscribed(event));
      break;
    case MesosOperatorEventTypes.TASK_ADDED:
      stream.next(translateTaskAdded(event));
      break;
    case MesosOperatorEventTypes.TASK_UPDATED:
      stream.next(translateTaskUpdated(event));
      break;
    case MesosOperatorEventTypes.AGENT_ADDED:
      stream.next(translateAgentAdded(event));
      break;
    case MesosOperatorEventTypes.AGENT_REMOVED:
      stream.next(translateAgentRemoved(event));
      break;
    case MesosOperatorEventTypes.FRAMEWORK_ADDED:
      stream.next(translateFrameworkAdded(event));
      break;
    case MesosOperatorEventTypes.FRAMEWORK_UPDATED:
      stream.next(translateFrameworkUpdated(event));
      break;
    case MesosOperatorEventTypes.FRAMEWORK_REMOVED:
      stream.next(translateFrameworkRemoved(event));
      break;
  }
};

apiClient.stream.subscribe(
  function(x) {
    translateEvent(x);
  },
  function(e) {
    console.log("onError: ", e);
  },
  function() {
    console.log("onCompleted");
  }
);

module.exports = { stream };
