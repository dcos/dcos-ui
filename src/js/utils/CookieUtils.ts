import cookie from "cookie";

const USER_COOKIE_KEY = "dcos-acs-info-cookie";

const Utils = {
  getUserMetadata() {
    return cookie.parse(document.cookie)[USER_COOKIE_KEY];
  },
  emptyCookieWithExpiry(date) {
    return cookie.serialize(USER_COOKIE_KEY, "", { expires: date });
  },
};

export default Utils;
