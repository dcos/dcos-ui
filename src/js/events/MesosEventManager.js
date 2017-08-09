import MasterClient from "../components/MesosOperatorApiClient";
import EventUtil from "../utils/mesos-operator-api/EventUtil";

const Bacon = require("baconjs").Bacon;
const { List } = require("immutable");

const callbacks = [];
var immutableQueue = List([]);

var MesosEventManager = {
  createEventStream() {
    return Bacon.fromCallback(function(callback) {
      callbacks.push(callback);
      callback(immutableQueue);
    });
  },
  startConnection() {
    function triggerEvent(immutableEvents) {
      callbacks.forEach(function(callback) {
        callback(immutableEvents);
      });
    }
    const eventsClient = new MasterClient({
      masterApiUri: "/mesos/api/v1",
      handlers: {
        SUBSCRIBED(data) {
          console.log("SUBSCRIBED ");
          console.log(data);

          const arr = List(
            EventUtil.generateEventsFromSubscribed(data["get_state"], false)
          );

          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        TASK_ADDED(data) {
          console.log("Got TASK_ADDED");
          console.log(data);
          const arr = List(
            EventUtil.generateEventsFromTask(data["task"], false)
          );

          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        TASK_UPDATED(data) {
          console.log("Got TASK_UPDATED");
          console.log(data);
          const arr = List(EventUtil.generateEventsFromTaskUpdate(data));

          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        AGENT_ADDED(data) {
          console.log("Got AGENT_ADDED");
          console.log(data);
          const arr = List(EventUtil.generateEventsFromAgent(data, false));
          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        AGENT_REMOVED(data) {
          console.log("Got AGENT_REMOVED");
          console.log(data);
          const arr = List(
            EventUtil.generateEventsFromAgentRemoved(data["agent_removed"])
          );
          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        FRAMEWORK_ADDED(data) {
          console.log("Got FRAMEWORK_ADDED" + data);
          console.log(data);
          const arr = List(
            EventUtil.generateEventsFromFramework(
              data["framework_added"],
              false
            )
          );
          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        FRAMEWORK_UPDATED(data) {
          console.log("Got FRAMEWORK_UPDATED");
          console.log(data);
          const arr = List(
            EventUtil.generateEventsFromFramework(
              data["framework_updated"],
              true
            )
          );
          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        FRAMEWORK_REMOVED(data) {
          console.log("Got FRAMEWORK_REMOVED");
          console.log(data);
          const arr = List(
            EventUtil.generateEventsFromFrameworkRemoved(
              data["framework_removed"]
            )
          );
          immutableQueue = immutableQueue.concat(arr);

          console.log("Diff Queue");
          console.log(arr);
          console.log(immutableQueue);

          triggerEvent(arr);
        },
        HEARTBEAT(data) {
          console.log("Got HEARTBEAT" + data);
        }
      }
    });

    eventsClient.on("subscribed", function() {
      console.log("SUBSCRIBED");
    });

    // Catch error events
    eventsClient.on("error", function(errorObj) {
      console.log("Got an error");
      console.log(JSON.stringify(errorObj));
    });

    eventsClient.subscribe();
  }
};

module.exports = MesosEventManager;
