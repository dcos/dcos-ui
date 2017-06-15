import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../src/js/constants/TransactionTypes";
import {
  COMMAND,
  HTTP,
  HTTPS,
  TCP
} from "../../constants/HealthCheckProtocols";
import { parseIntValue } from "../../../../../../src/js/utils/ReducerUtil";
import MesosCommandTypes from "../../constants/MesosCommandTypes";
import Transaction from "../../../../../../src/js/structs/Transaction";
import ValidatorUtil from "../../../../../../src/js/utils/ValidatorUtil";

/**
 * JSON Parser Fragment for `HttpHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @returns {Array} - Returns an array with the new transactions to append
 */
function parseHttpHealthCheck(healthCheck, path) {
  const memo = [];

  if (healthCheck.endpoint != null) {
    memo.push(
      new Transaction(path.concat(["endpoint"]), healthCheck.endpoint, SET)
    );
  }

  if (healthCheck.path != null) {
    memo.push(new Transaction(path.concat(["path"]), healthCheck.path, SET));
  }

  if (healthCheck.scheme != null) {
    memo.push(
      new Transaction(path.concat(["https"]), healthCheck.scheme === HTTPS, SET)
    );
  }

  return memo;
}

function reduceHttpHealthCheck(state, field, value) {
  const newState = Object.assign({}, state);
  newState.http = Object.assign({}, newState.http || {});

  switch (field) {
    case "endpoint":
      newState.http.endpoint = value;
      break;

    case "path":
      newState.http.path = value;
      break;

    case "https":
      if (value) {
        newState.http.scheme = HTTPS;
      } else {
        newState.http.scheme = HTTP;
      }
      break;
  }

  return newState;
}

function reduceFormHttpHealthCheck(state, field, value) {
  const newState = Object.assign({}, state);
  newState.http = Object.assign({}, newState.http || {});

  switch (field) {
    case "https":
      newState.http.https = value;
      break;
  }

  return newState;
}

/**
 * JSON Parser Fragment for `TcpHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @returns {Array} - Returns an array with the new transactions to append
 */
function parseTcpHealthCheck(healthCheck, path) {
  const memo = [];

  if (healthCheck.endpoint != null) {
    memo.push(
      new Transaction(path.concat(["endpoint"]), healthCheck.endpoint, SET)
    );
  }

  return memo;
}

function reduceTcpHealthCheck(state, field, value) {
  const newState = Object.assign({}, state);
  newState.tcp = Object.assign({}, newState.tcp || {});

  switch (field) {
    case "endpoint":
      newState.tcp.endpoint = value;
      break;
  }

  return newState;
}

/**
 * JSON Parser Fragment for `CommandHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @returns {Array} - Returns an array with the new transactions to append
 */
function parseCommandHealthCheck(healthCheck, path) {
  const memo = [];
  const { command = {} } = healthCheck;

  if (command.shell != null) {
    memo.push(
      new Transaction(
        path.concat(["command", "type"]),
        MesosCommandTypes.SHELL,
        SET
      )
    );

    memo.push(
      new Transaction(path.concat(["command", "value"]), command.shell, SET)
    );
  }

  if (command.argv != null && Array.isArray(command.argv)) {
    memo.push(
      new Transaction(
        path.concat(["command", "type"]),
        MesosCommandTypes.ARGV,
        SET
      )
    );

    // Always cast to string, since the UI cannot handle arrays
    memo.push(
      new Transaction(
        path.concat(["command", "value"]),
        command.argv.join(" "),
        SET
      )
    );
  }

  return memo;
}

function reduceCommandHealthCheck(state, field, value) {
  const newState = Object.assign({}, state);
  newState.exec = Object.assign({}, newState.exec || {});
  newState.exec.command = Object.assign({}, newState.exec.command || {});
  const command = newState.exec.command;

  switch (field) {
    case "type":
      // Shell is a meta-field that denotes if we are going to populate
      // the argument or the shell field. So, if we encounter an opposite
      // field, we should convert and set-up a placeholder
      if (value === MesosCommandTypes.SHELL) {
        command.shell = "";
        if (command.argv != null && Array.isArray(command.argv)) {
          command.shell = command.argv.join(" ");
          delete command.argv;
        }

        break;
      }

      if (value === MesosCommandTypes.ARGV) {
        command.argv = [];
        if (command.shell != null) {
          command.argv = command.shell.split(" ");
          delete command.shell;
        }

        break;
      }
      break;

    case "value":
      // By default we are creating `shell`. Only if `argv` exists
      // we should create an array
      if (command.argv != null) {
        command.argv = value.split(" ");
      } else {
        command.shell = value;
      }
      break;
  }

  return newState;
}

function reduceFormCommandHealthCheck(state, field, value) {
  const newState = Object.assign({}, state);
  newState.exec = Object.assign({}, newState.exec || {});
  newState.exec.command = Object.assign({}, newState.exec.command || {});
  const command = newState.exec.command;

  switch (field) {
    case "type":
      command.type = value;
      break;

    case "value":
      command.value = value;
      break;
  }

  return newState;
}

const MultiContainerHealthChecks = {
  JSONSegmentReducer(state, { type, path, value }) {
    const newState = Object.assign({}, state);
    const [group, field, secondField] = path;

    // ADD_ITEM does nothing more but to define an object as a value,
    // since we cannot have more than 1 items.
    if (type === ADD_ITEM) {
      if (path.length !== 0) {
        if (process.env.NODE_ENV !== "production") {
          throw new TypeError("Trying to ADD_ITEM on a wrong health path");
        }

        return newState;
      }

      return {};
    }

    // REMOVE_ITEM resets the state back to `null` since we can only
    // have one item.
    if (type === REMOVE_ITEM) {
      if (path.length !== 0) {
        if (process.env.NODE_ENV !== "production") {
          throw new TypeError("Trying to REMOVE_ITEM on a wrong health path");
        }

        return newState;
      }

      return null;
    }

    // Format object structure according to protocol switch
    if (group === "protocol") {
      switch (value) {
        case COMMAND:
          newState.exec = {
            command: {}
          };
          delete newState.http;
          delete newState.tcp;
          break;

        case HTTP:
          delete newState.exec;
          newState.http = {
            scheme: HTTP
          };
          delete newState.tcp;
          break;

        case TCP:
          delete newState.exec;
          delete newState.http;
          newState.tcp = {};
          break;
      }

      return newState;
    }

    // Assign properties
    switch (group) {
      case "exec":
        return reduceCommandHealthCheck(newState, secondField, value);

      case "http":
        return reduceHttpHealthCheck(newState, field, value);

      case "tcp":
        return reduceTcpHealthCheck(newState, field, value);

      case "gracePeriodSeconds":
        newState.gracePeriodSeconds = parseIntValue(value);
        break;

      case "intervalSeconds":
        newState.intervalSeconds = parseIntValue(value);
        break;

      case "maxConsecutiveFailures":
        newState.maxConsecutiveFailures = parseIntValue(value);
        break;

      case "timeoutSeconds":
        newState.timeoutSeconds = parseIntValue(value);
        break;

      case "delaySeconds":
        newState.delaySeconds = parseIntValue(value);
        break;
    }

    return newState;
  },

  JSONSegmentParser(healthCheck, path) {
    let memo = [];
    if (ValidatorUtil.isEmpty(healthCheck)) {
      return memo;
    }

    // Add an ADD_ITEM transaction
    memo.push(new Transaction(path, null, ADD_ITEM));

    // Parse detailed fields according to type
    if (healthCheck.http != null) {
      memo.push(new Transaction(path.concat(["protocol"]), HTTP, SET));
      memo = memo.concat(
        parseHttpHealthCheck(healthCheck.http, path.concat(["http"]), memo)
      );
    }
    if (healthCheck.tcp != null) {
      memo.push(new Transaction(path.concat(["protocol"]), TCP, SET));
      memo = memo.concat(
        parseTcpHealthCheck(healthCheck.tcp, path.concat(["tcp"]), memo)
      );
    }
    if (healthCheck.exec != null) {
      memo.push(new Transaction(path.concat(["protocol"]), COMMAND, SET));
      memo = memo.concat(
        parseCommandHealthCheck(healthCheck.exec, path.concat(["exec"]), memo)
      );
    }

    // Parse generic fields
    if (healthCheck.gracePeriodSeconds != null) {
      memo.push(
        new Transaction(
          path.concat(["gracePeriodSeconds"]),
          parseIntValue(healthCheck.gracePeriodSeconds),
          SET
        )
      );
    }
    if (healthCheck.intervalSeconds != null) {
      memo.push(
        new Transaction(
          path.concat(["intervalSeconds"]),
          parseIntValue(healthCheck.intervalSeconds),
          SET
        )
      );
    }
    if (healthCheck.maxConsecutiveFailures != null) {
      memo.push(
        new Transaction(
          path.concat(["maxConsecutiveFailures"]),
          parseIntValue(healthCheck.maxConsecutiveFailures),
          SET
        )
      );
    }
    if (healthCheck.timeoutSeconds != null) {
      memo.push(
        new Transaction(
          path.concat(["timeoutSeconds"]),
          parseIntValue(healthCheck.timeoutSeconds),
          SET
        )
      );
    }
    if (healthCheck.delaySeconds != null) {
      memo.push(
        new Transaction(
          path.concat(["delaySeconds"]),
          parseIntValue(healthCheck.delaySeconds),
          SET
        )
      );
    }

    return memo;
  },

  FormReducer(state, { type, path, value }) {
    const newState = MultiContainerHealthChecks.JSONSegmentReducer.call(
      this,
      state,
      { type, path, value }
    );

    // Bail early on nulled cases
    if (newState == null) {
      return newState;
    }

    const [group, field, secondField] = path;

    // Include additional fields only present in the form
    if (group === "protocol") {
      newState.protocol = value;
    }

    // Assign detailed properties
    switch (group) {
      case "exec":
        return reduceFormCommandHealthCheck(newState, secondField, value);

      case "http":
        return reduceFormHttpHealthCheck(newState, field, value);
    }

    return newState;
  }
};

module.exports = MultiContainerHealthChecks;
