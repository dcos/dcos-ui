/**
 * The following string defines the RAMLError class, instantiated by the
 * validator when an error occurs.
 */
module.exports = `
const REPLACE_MESSAGE_TEMPLATE = /\\{([^\\}]+)}/g;

function RAMLError(path, message, _messageVariables) {
  var messageVariables = _messageVariables || {};

  Object.defineProperty(this, 'path', {
    enumerable: true,
    get: function() {
      return path;
    },
  });

  Object.defineProperty(this, 'message', {
    enumerable: true,
    get: function() {
      return message.replace(REPLACE_MESSAGE_TEMPLATE, function(match) {
        return ''+messageVariables[match.slice(1,-1)] || '';
      });
    },
  });
}
`;
