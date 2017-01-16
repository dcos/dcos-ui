import DefaultErrorMessages from '../../../../../src/js/constants/DefaultErrorMessages';
import ErrorMessagesUtil from '../../../../../src/js/utils/ErrorMessagesUtil';

const ServiceErrorMessages = ErrorMessagesUtil.extend({

  'id': {
    PROP_MISSING: 'Service ID is required',
    ALREADY_EXISTS: 'A service with this ID already exists',
    STRING_PATTERN: 'Service ID may only contain digits (0-9), dashes (-), ' +
      'dots (.),lowercase letters (a-z), and slashes (/) e.g. /group/my-service'
  }

}, DefaultErrorMessages);

module.exports = ServiceErrorMessages;
