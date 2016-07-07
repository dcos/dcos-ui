import classNames from 'classnames';
import React from 'react';

import Icon from './Icon';

const METHODS_TO_BIND = [
  'handleVisibilityToggle'
];

class SecretValue extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {hidden: true};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleVisibilityToggle() {
    this.setState({hidden: !this.state.hidden});
  }

  getValue() {
    let {props, state} = this;
    if (state.hidden) {
      return props.hiddenValue;
    }

    return props.value;
  }

  getIcon() {
    let iconID = 'eye';

    if (!this.state.hidden) {
      iconID = 'eye-slash';
    }

    let iconClassNames = classNames(
      'secret-toggle clickable',
      this.props.iconClassName
    );

    return (
      <Icon
        className={iconClassNames}
        color="white"
        family="mini"
        id={iconID}
        onClick={this.handleVisibilityToggle}
        size="mini" />
    );
  }

  render() {
    let {className} = this.props;
    let containerClassName = classNames('secret-value', className);

    return (
      <span className={containerClassName}>
        {this.getValue()}
        {this.getIcon()}
      </span>
    );
  }
}

SecretValue.defaultProps = {
  hiddenValue: '••••••••'
};

SecretValue.propTypes = {
  className: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object
  ]),
  hiddenValue: React.PropTypes.string,
  iconClassName: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object
  ]),
  value: React.PropTypes.string
};

module.exports = SecretValue;
