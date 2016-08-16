import cookie from 'cookie';

import {userCookieKey} from '../constants/AuthConstants';

let Utils = {
  getUserMetadata() {
    return cookie.parse(global.document.cookie)[userCookieKey];
  },
  emptyCookieWithExpiry(date) {
    return cookie.serialize(
      userCookieKey, '', {expires: date}
    );
  }
};

module.exports = Utils;
