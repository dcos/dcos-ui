import React, {PropTypes} from 'react';

import hooks from './hooks';

const METHODS_TO_BIND = [
  'updateState'
];

/**
 * AuthPoint is used to wrap around certain UI components that are not
 * accessible to users with limited previliges.
 *
 * @example
 * import {AuthPoint, AuthService} from 'foundation-ui/auth';
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
 *       AuthService.on(permission, this.checkPermission(permission));
 *     })
 *   }
 *
 *   onPermissionChange() {
 *     // Resubscribe
 *     this.permissions.forEach(function (permission) {
 *       AuthService.removeListener(permission, this.checkPermission(permission));
 *     })
 *     this.permissions.forEach(function (permission) {
 *       AuthService.on(permission, this.checkPermission(permission));
 *     })
 *   }
 * }
 *
 * class MyComponent extends React.Component {
 *   render() {
 *     return (
 *       <AuthPoint id="dcos:ui:sidebar-tabs">
 *         // Will not be shown if myCallback (above) returns false.
 *         <SystemTab />
 *       </AuthPoint>
 *     );
 *   }
 * };
 */
class AuthPoint extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.updateState();
    // Register for changes in AuthPoint specific to this id.
    // Whenever AuthPoint has a change it will end up invoking updateState
    // so we can get the newly filtered children.
    hooks.addAction(this.props.id, this.updateState);
  }

  componentWillUnmount() {
    // Hooks will need ability to remove previously added actions.
    hooks.removeAction(this.props.id, this.updateState);
  }

  updateState() {
    let {id, defaultValue} = this.props;
    // Looking for a Boolean
    const authorized = !!hooks.applyFilter(id, defaultValue);

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

AuthPoint.defaultProps = {
  replacementComponent: null,
  defaultValue: false
};

AuthPoint.propTypes = {
  id: PropTypes.string.isRequired,
  defaultValue: PropTypes.bool,
  replacementComponent: PropTypes.node
};

module.exports = AuthPoint;
