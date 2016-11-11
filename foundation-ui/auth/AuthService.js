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

}

module.exports = new AuthService();
