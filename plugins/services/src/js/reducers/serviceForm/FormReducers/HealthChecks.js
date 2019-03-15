import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import {
  MESOS_HTTP,
  MESOS_HTTPS
} from "../../../constants/HealthCheckProtocols";

export default {
  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }
    if (this.cache == null) {
      this.cache = [];
    }

    const joinedPath = path.join(".");

    if (type === REMOVE_ITEM && joinedPath === "portDefinitions") {
      state = state
        .map(item => {
          if (item.portIndex === value) {
            return null;
          }

          if (item.portIndex > value) {
            item.portIndex--;
          }

          return item;
        })
        .filter(item => {
          return item != null;
        });
    }

    if (joinedPath.search("healthChecks") !== -1) {
      if (joinedPath === "healthChecks") {
        switch (type) {
          case ADD_ITEM:
            state.push(Object.assign({}, value) || {});
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET) {
        if (`healthChecks.${index}.protocol` === joinedPath) {
          state[index].protocol = value;
          if (value === MESOS_HTTP && this.cache[index]) {
            state[index].protocol = MESOS_HTTPS;
          }
        }
        if (`healthChecks.${index}.portIndex` === joinedPath) {
          state[index].portIndex = parseIntValue(value);
        }
        if (`healthChecks.${index}.command` === joinedPath) {
          state[index].command = value;
        }
        if (`healthChecks.${index}.isIPv6` === joinedPath) {
          state[index].isIPv6 = value;
        }
        if (`healthChecks.${index}.path` === joinedPath) {
          state[index].path = value;
        }
        if (`healthChecks.${index}.gracePeriodSeconds` === joinedPath) {
          state[index].gracePeriodSeconds = value;
        }
        if (`healthChecks.${index}.intervalSeconds` === joinedPath) {
          state[index].intervalSeconds = value;
        }
        if (`healthChecks.${index}.timeoutSeconds` === joinedPath) {
          state[index].timeoutSeconds = value;
        }
        if (`healthChecks.${index}.maxConsecutiveFailures` === joinedPath) {
          state[index].maxConsecutiveFailures = value;
        }
        if (`healthChecks.${index}.https` === joinedPath) {
          this.cache[index] = value;
          if (value === true) {
            state[index].protocol = MESOS_HTTPS;
          } else {
            state[index].protocol = MESOS_HTTP;
          }
        }
      }
    }

    return state;
  }
};
