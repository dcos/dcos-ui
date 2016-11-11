import {EventEmitter} from 'events';
import Authorizer from './Authorizer';

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
  }

}

module.exports = new AuthService();
