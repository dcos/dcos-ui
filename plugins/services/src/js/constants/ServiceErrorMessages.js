import DefaultErrorMessages from '../../../../../src/js/constants/DefaultErrorMessages';

const ServiceErrorMessages = [
  {
    path: /^id$/,
    type: 'PROP_IS_MISSING',
    message: 'Service ID is required'
  },
  {
    path: /^id$/,
    type: 'ALREADY_EXISTS',
    message: 'A service with this ID already exists'
  },
  {
    path: /^id$/,
    type: 'STRING_PATTERN',
    message: 'Service ID may only contain digits (0-9), dashes (-), ' +
      'dots (.),lowercase letters (a-z), and slashes (/) e.g. /group/my-service'
  }
].concat(DefaultErrorMessages);

module.exports = ServiceErrorMessages;
