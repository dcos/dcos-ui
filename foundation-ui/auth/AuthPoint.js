import React, {PropTypes} from 'react';

import AuthService from './AuthService';

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
 *       AuthService.register(permission, this.checkPermission.bind(this, permission));
 *     })
 *   }
 * }
 *
 * class MyComponent extends React.Component {
 *   render() {
 *     return (
 *       <AuthPoint id="dcos:ui:sidebar-tabs">
 *         // Will not be shown if checkPermission (above) returns false.
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
    AuthService.addListener(this.props.id, this.updateState);
  }

  componentWillReceiveProps(nextProps) {
    // Update mount contents when new props are received
    this.updateState(nextProps);
  }

  componentWillUnmount() {
    // Hooks will need ability to remove previously added actions.
    AuthService.removeListener(this.props.id, this.updateState);
  }

  updateState(props = this.props) {
    let {defaultValue, id} = props;
    let blackList = ['children', ...Object.keys(AuthPoint.propTypes)];
    // Filter props consumed by AuthPoint to create childProps
    let childProps = Object.keys(props).filter(function (key) {
      return !blackList.includes(key);
    }).reduce(function (memo, key) {
      memo[key] = props[key];

      return memo;
    }, {});

    // Looking for a Boolean
    const authorized = AuthService.isAuthorized(id, defaultValue, childProps);

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
  // If nothing registers we want to have everything authorized
  defaultValue: true
};

AuthPoint.propTypes = {
  id: PropTypes.string.isRequired,
  defaultValue: PropTypes.bool,
  replacementComponent: PropTypes.node
};

module.exports = AuthPoint;
