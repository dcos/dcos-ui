import classNames from 'classnames';
import React from 'react';

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
    let iconClassNames = classNames(
      'icon icon-sprite icon-sprite-mini icon-sprite-mini-white icon-alert',
      'secret-toggle clickable',
      this.props.iconClassName
    );

    return (
      <i className={iconClassNames}
        onClick={this.handleVisibilityToggle} />
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
