/**
 * The following string defines the RAMLError class, instantiated by the
 * validator when an error occurs.
 */
module.exports = `
const REPLACE_MESSAGE_TEMPLATE = /\\{\\{([^\\}]+)\\}\\}/g;

function RAMLError(path, context, type, _messageVariables) {
  var messageVariables = _messageVariables || {};
  var message = context.ERROR_MESSAGES[type];
  Object.defineProperties(this, {
    message: {
      enumerable: true,
      get: function() {
        if (typeof message === 'function') {
          return message(messageVariables, path);
        }

        return message.replace(REPLACE_MESSAGE_TEMPLATE, function(match) {
          return ''+messageVariables[match.slice(2,-2)] || '';
        });
      }
    },
    path: {
      enumerable: true,
      value: path
    },
    type: {
      enumerable: true,
      value: type
    },
    variables: {
      enumerable: true,
      value: messageVariables
    }
  });
}
`;
