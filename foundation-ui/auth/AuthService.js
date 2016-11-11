import {EventEmitter} from 'events';

import Authorizer from './Authorizer';
import {CHANGE} from './AuthEvent';

/**
 * List of authorizers
 *
 * @type {Array.<Authorizer>}
 */
const authorizers = [];

/**
 * AuthService
 */
class AuthService extends EventEmitter {

  /**
   * Register authorizer
   *
   * @param {Authorizer} authorizer
   */
  registerAuthorizer(authorizer) {
    if (!authorizer || !(authorizer instanceof Authorizer)) {
      if (global.__DEV__) {
        throw new TypeError('Provided component must be a ' +
            'React.Component constructor or a stateless functional component.');
      }

      return;
    }

    authorizers.push(authorizer);
    this.emit(CHANGE);
  }

  /**
   * Unregisters authorizer
   *
   * @param  {Authorizer} authorizer
   */
  unregisterAuthorizer(authorizer) {
    let i = authorizers.length;
    while (--i >= 0) {
      if (authorizers[i] === authorizer) {
        authorizers.splice(i, 1);
        break;
      }
    }

    this.emit(CHANGE);
  }

  /**
   * Authorize current user if required permission was granted
   *
   * @param  {string} permission
   *
   * @returns {boolean} authorized
   */
  authorize(permission = '') {
    return authorizers.every((authorizer) => authorizer.authorize(permission));
  }

}

module.exports = new AuthService();
