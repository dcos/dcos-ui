import React, {PropTypes} from 'react';

import AuthService from './AuthService';
import {CHANGE} from './AuthEvent';
import ReactUtil from '../utils/ReactUtil';

const METHODS_TO_BIND = [
  'onAuthServiceChange'
];

/**
 * A component to show/hide elements based on user permissions. It is using
 * the `AuthService` to authorize the current user if the required
 * `permission` was granted.
 * The component also provides a property (`wrapper`) to configure the wrapping
 * component as well as the wrapping behavior.
 *
 * @example
 *
 * <Auth permission="*" wrapper={MyWidgetsWrapper}>
 *     <span>My Secrets</span>
 * </Auth>
 *
 */
class Auth extends React.Component {
  constructor() {
    super(...arguments);

    // Get components and init state
    this.state = {
      authorized: AuthService.authorize(this.props.permission)
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    AuthService.addListener(CHANGE, this.onAuthServiceChange);
  }

  componentWillReceiveProps({permission}) {
    if (this.props.permission === permission) {
      return;
    }

    this.setState({authorized: AuthService.authorize(permission)});
  }

  componentWillUnmount() {
    AuthService.removeListener(CHANGE, this.onAuthServiceChange);
  }

  onAuthServiceChange() {
    this.setState({authorized: AuthService.authorize(this.props.permission)});
  }

  render() {
    const {alwaysWrap, children, wrapper} = this.props;
    const {authorized} = this.state;

    if (!authorized) {
      return null;
    }

    return ReactUtil.wrapElements(children, wrapper, alwaysWrap);
  }
}

Auth.defaultProps = {
  alwaysWrap: false,
  wrapper: 'div'
};

Auth.propTypes = {
  alwaysWrap: PropTypes.bool,
  children: PropTypes.element,
  permission: PropTypes.string.isRequired,
  wrapper: PropTypes.node
};

module.exports = Auth;
