import {
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import {COMMAND, HTTP, TCP} from '../../constants/HealtCheckProtocols';
import Transaction from '../../../../../../src/js/structs/Transaction';

function intOrNull(value) {
  if ((value === '') || (value === null) || (value === undefined)) {
    return null;
  }

  return parseInt(value);
}

/**
 * JSON Parser Fragment for `HttpHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @param {Array} memo - The memo object where to append the transations
 */
function parseHttpHealthCheck(healthCheck, path, memo) {
  if (healthCheck.endpoint != null) {
    memo.push(new Transaction(
      path.concat(['endpoint']),
      healthCheck.endpoint,
      SET
    ));
  }

  if (healthCheck.path != null) {
    memo.push(new Transaction(
      path.concat(['path']),
      healthCheck.path,
      SET
    ));
  }

  if (healthCheck.scheme != null) {
    memo.push(new Transaction(
      path.concat(['scheme']),
      healthCheck.scheme,
      SET
    ));
  }
}

function reduceHttpHealthCheck(newState, field, value) {
  switch (field) {
    case 'endpoint':
      newState.http.endpoint = value;
      break;

    case 'path':
      newState.http.path = value;
      break;

    case 'scheme':
      newState.http.scheme = value;
      break;
  }
}

/**
 * JSON Parser Fragment for `TcpHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @param {Array} memo - The memo object where to append the transations
 */
function parseTcpHealthCheck(healthCheck, path, memo) {
  if (healthCheck.endpoint != null) {
    memo.push(new Transaction(
      path.concat(['endpoint']),
      healthCheck.endpoint,
      SET
    ));
  }
}

function reduceTcpHealthCheck(newState, field, value) {
  switch (field) {
    case 'endpoint':
      newState.endpoint = value;
      break;
  }
}

/**
 * JSON Parser Fragment for `CommandHealthCheck` type
 *
 * @param {Object} healthCheck - The healthcheck data to parse
 * @param {Array} path - The path prefix to the transaction
 * @param {Array} memo - The memo object where to append the transations
 */
function parseCommandHealthCheck(healthCheck, path, memo) {
  const {command} = healthCheck;

  if (command.shell != null) {
    memo.push(new Transaction(
      path.concat(['shell']),
      true,
      SET
    ));

    memo.push(new Transaction(
      path.concat(['command']),
      command.shell,
      SET
    ));
  }

  if (command.argv != null) {
    memo.push(new Transaction(
      path.concat(['shell']),
      false,
      SET
    ));

    // Always cast to string, since the UI cannot handle arrays
    memo.push(new Transaction(
      path.concat(['command']),
      command.argv.join(' '),
      SET
    ));
  }
}

function reduceCommandHealthCheck(newState, field, value) {
  const {exec: {command}} = newState;

  switch (field) {
    case 'shell':
      // Shell is a meta-field that denotes if we are going to populate
      // the argument or the shell field. So, if we encounter an opposite
      // field, we should convert and set-up a placeholder
      if (value) {
        command.shell = '';
        if (command.argv != null) {
          command.shell = command.argv.join(' ');
          delete command.argv;
        }
      } else {
        command.argv = [];
        if (command.shell != null) {
          command.argv = command.shell.split(' ');
          delete command.shell;
        }
      }
      break;

    case 'command':
      if (command.shell != null) {
        command.shell = value;
      } else {
        command.shell = value.split(' ');
      }
      break;
  }
}

module.exports = {
  JSONSegmentReducer(state, {path, value}) {
    const newState = Object.assign({}, state);
    const [group, field] = path;

    // If we are assigning the entire group to `null`, we are
    // effectively disabling the health checks
    if ((path.length === 0) && (value == null)) {
      return null;
    }

    // Format object structure according to protocol switch
    if (group === 'protocol') {
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
          newState.http = {};
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
      case 'exec':
        reduceTcpHealthCheck(newState, field, value);
        break;

      case 'http':
        reduceHttpHealthCheck(newState, field, value);
        break;

      case 'tcp':
        reduceCommandHealthCheck(newState, field, value);
        break;

      case 'gracePeriodSeconds':
        newState.gracePeriodSeconds = intOrNull(value);
        break;

      case 'intervalSeconds':
        newState.intervalSeconds = intOrNull(value);
        break;

      case 'maxConsecutiveFailures':
        newState.maxConsecutiveFailures = intOrNull(value);
        break;

      case 'timeoutSeconds':
        newState.timeoutSeconds = intOrNull(value);
        break;

      case 'delaySeconds':
        newState.delaySeconds = intOrNull(value);
        break;
    }

    return newState;
  },

  JSONSegmentParser(healthCheck, path) {
    const memo = [];

    // Parse detailed fields according to type
    if (healthCheck.http != null) {
      memo.push(new Transaction(path.concat(['protocol']), HTTP, SET));
      parseHttpHealthCheck(healthCheck.http, path.concat(['http']), memo);
    }
    if (healthCheck.tcp != null) {
      memo.push(new Transaction(path.concat(['protocol']), TCP, SET));
      parseTcpHealthCheck(healthCheck.tcp, path.concat(['tcp']), memo);
    }
    if (healthCheck.exec != null) {
      memo.push(new Transaction(path.concat(['protocol']), COMMAND, SET));
      parseCommandHealthCheck(healthCheck.exec, path.concat(['exec']), memo);
    }

    // Parse generic fields
    if (healthCheck.gracePeriodSeconds != null) {
      memo.push(new Transaction(
        path.concat(['gracePeriodSeconds']),
        parseInt(healthCheck.gracePeriodSeconds),
        SET
      ));
    }
    if (healthCheck.intervalSeconds != null) {
      memo.push(new Transaction(
        path.concat(['intervalSeconds']),
        parseInt(healthCheck.intervalSeconds),
        SET
      ));
    }
    if (healthCheck.maxConsecutiveFailures != null) {
      memo.push(new Transaction(
        path.concat(['maxConsecutiveFailures']),
        parseInt(healthCheck.maxConsecutiveFailures),
        SET
      ));
    }
    if (healthCheck.timeoutSeconds != null) {
      memo.push(new Transaction(
        path.concat(['timeoutSeconds']),
        parseInt(healthCheck.timeoutSeconds),
        SET
      ));
    }
    if (healthCheck.delaySeconds != null) {
      memo.push(new Transaction(
        path.concat(['delaySeconds']),
        parseInt(healthCheck.delaySeconds),
        SET
      ));
    }

    return memo;
  }
};
