import React, {PropTypes} from 'react';

import Hooks from '../services/Hooks';
import ServiceFactory from '../factories/ServiceFactory';

const hooks = new Hooks();
const METHODS_TO_BIND = [
  'updateState'
];

/*
 * Example usage:
 *
 * import {Authorize, Authorization} from 'foundation-ui/services/AuthorizeBundle';
 *
 * class AuthenticationPlugin {
 *   permissions: [
 *     'dcos:ui:sidebar-tabs',
 *     'dcos:services:marathon:full',
 *     ... // other permissions
 *   ]
 *
 *   checkPermission(permission) {
 *     // Some logic like looking at a cache of user permissions and determining
 *     // if they should see this component.
 *     return acls.contains(permission);
 *   }
 *
 *   initialize() {
 *     this.permissions.forEach(function (permission) {
 *       Authorization.on(permission, this.checkPermission(permission));
 *     })
 *   }
 *
 *   onPermissionChange() {
 *     // Resubscribe
 *     this.permissions.forEach(function (permission) {
 *       Authorization.removeListener(permission, this.checkPermission(permission));
 *     })
 *     this.permissions.forEach(function (permission) {
 *       Authorization.on(permission, this.checkPermission(permission));
 *     })
 *   }
 * }
 *
 * class MyComponent extends React.Component {
 *   render() {
 *     return (
 *       <Authorize authId="dcos:ui:sidebar-tabs">
 *         // Will not be shown if myCallback (above) returns false.
 *         <SystemTab />
 *       </Authorize>
 *     );
 *   }
 * };
 */
class Authorize extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.updateState();
    // Register for changes in Authorize specific to this authId.
    // Whenever Authorize has a change it will end up invoking updateState
    // so we can get the newly filtered children.
    hooks.addAction(this.props.authId, this.updateState);
  }

  componentWillUnmount() {
    // Hooks will need ability to remove previously added actions.
    hooks.removeAction(this.props.authId, this.updateState);
  }

  updateState() {
    let {authId, defaultValue} = this.props;
    // Looking for a Boolean
    const authorized = !!hooks.applyFilter(authId, defaultValue);

    this.setState({authorized});
  }

  render() {
    let {children, replacementComponent} = this.props;
    if (this.state.authorized) {
      return children;
    }

    return replacementComponent;
  }
}

Authorize.defaultProps = {
  replacementComponent: null,
  defaultValue: false
};

Authorize.propTypes = {
  authId: PropTypes.string.isRequired,
  defaultValue: PropTypes.bool,
  replacementComponent: PropTypes.node
};

module.exports = {
  Authorization: new ServiceFactory(hooks),
  Authorize
};
