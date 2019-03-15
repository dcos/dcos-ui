import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import Util from "#SRC/js/utils/Util";
import Transaction from "#SRC/js/structs/Transaction";
import {
  COMMAND,
  MESOS_HTTP,
  MESOS_HTTPS
} from "../../../constants/HealthCheckProtocols";

function getMapHealthChecks(runtime) {
  return function mapHealthChecks(item) {
    const newItem = Util.omit(item, [
      "path",
      "command",
      "protocol",
      "https",
      "ipProtocol"
    ]);

    if (item.protocol != null) {
      newItem.protocol = item.protocol;
      if (item.protocol.toUpperCase() === COMMAND && item.command != null) {
        newItem.command = {
          value: item.command
        };
      }

      if (item.protocol.toUpperCase() !== COMMAND) {
        newItem.path = item.path ? item.path : null;
        if (item.ipProtocol && runtime === "DOCKER") {
          newItem.ipProtocol = item.ipProtocol ? item.ipProtocol : null;
        }
      }
    }

    return newItem;
  };
}

export default {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.runtime == null) {
      // `this` is a context which is given to every reducer so it could
      // cache information.
      // In this case we are caching the values for `container.type`
      this.runtime = "DOCKER";
    }

    if (this.healthChecks == null) {
      // `this` is a context which is given to every reducer so it could
      // cache information.
      // In this case we are caching an array structure and although the
      // output structure is a object. But this enables us to not overwrite
      // values if there are two values with the same key temporarily.
      this.healthChecks = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath === "container.type") {
      this.runtime = value;
    }
    if (type === REMOVE_ITEM && joinedPath === "portDefinitions") {
      this.healthChecks = this.healthChecks
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
            this.healthChecks.push(value || {});
            break;
          case REMOVE_ITEM:
            this.healthChecks = this.healthChecks.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return this.healthChecks.map(getMapHealthChecks(this.runtime));
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET) {
        if (`healthChecks.${index}.protocol` === joinedPath) {
          this.healthChecks[index].protocol = value;
          if (value === MESOS_HTTP && this.healthChecks[index].https) {
            this.healthChecks[index].protocol = MESOS_HTTPS;
          }
        }
        if (`healthChecks.${index}.portIndex` === joinedPath) {
          this.healthChecks[index].portIndex = parseIntValue(value);
        }
        if (`healthChecks.${index}.command` === joinedPath) {
          this.healthChecks[index].command = value;
        }
        if (`healthChecks.${index}.isIPv6` === joinedPath) {
          this.healthChecks[index].ipProtocol = value ? "IPv6" : "IPv4";
        }
        if (`healthChecks.${index}.path` === joinedPath) {
          this.healthChecks[index].path = value;
        }
        if (`healthChecks.${index}.gracePeriodSeconds` === joinedPath) {
          this.healthChecks[index].gracePeriodSeconds = parseIntValue(value);
        }
        if (`healthChecks.${index}.intervalSeconds` === joinedPath) {
          this.healthChecks[index].intervalSeconds = parseIntValue(value);
        }
        if (`healthChecks.${index}.timeoutSeconds` === joinedPath) {
          this.healthChecks[index].timeoutSeconds = parseIntValue(value);
        }
        if (`healthChecks.${index}.maxConsecutiveFailures` === joinedPath) {
          this.healthChecks[index].maxConsecutiveFailures = parseIntValue(
            value
          );
        }
        if (`healthChecks.${index}.https` === joinedPath) {
          this.healthChecks[index].https = value;
          if (value === true) {
            this.healthChecks[index].protocol = MESOS_HTTPS;
          } else {
            this.healthChecks[index].protocol = MESOS_HTTP;
          }
        }
      }
    }

    return this.healthChecks.map(getMapHealthChecks(this.runtime));
  },
  JSONParser(state) {
    if (state.healthChecks == null) {
      return [];
    }

    return state.healthChecks.reduce(function(memo, item, index) {
      if (item.protocol == null) {
        return memo;
      }
      memo.push(new Transaction(["healthChecks"], item, ADD_ITEM));
      memo.push(
        new Transaction(
          ["healthChecks", index, "protocol"],
          item.protocol.toUpperCase(),
          SET
        )
      );
      if (item.protocol.toUpperCase() === COMMAND) {
        if (item.command != null && item.command.value != null) {
          memo.push(
            new Transaction(
              ["healthChecks", index, "command"],
              item.command.value,
              SET
            )
          );
        }
      }
      if (
        item.protocol.toUpperCase().replace(MESOS_HTTPS, MESOS_HTTP) ===
        MESOS_HTTP
      ) {
        if (item.protocol === MESOS_HTTPS) {
          memo.push(
            new Transaction(["healthChecks", index, "https"], true, SET)
          );
        }
      }
      if (item.ipProtocol != null) {
        memo.push(
          new Transaction(
            ["healthChecks", index, "isIPv6"],
            item.ipProtocol === "IPv6",
            SET
          )
        );
      }

      [
        "path",
        "portIndex",
        "gracePeriodSeconds",
        "intervalSeconds",
        "timeoutSeconds",
        "maxConsecutiveFailures"
      ].forEach(key => {
        if (item[key] != null) {
          memo.push(
            new Transaction(["healthChecks", index, key], item[key], SET)
          );
        }
      });

      return memo;
    }, []);
  }
};
