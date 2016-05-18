import classNames from 'classnames';
import React from 'react';

class ToggleButton extends React.Component {
  render() {
    let {
      checkboxClassName,
      checked,
      children,
      className,
      onChange
    } = this.props;

    return (
      <label className={classNames(className)}>
        <input
          className={classNames(checkboxClassName)}
          checked={checked}
          name="checkbox"
          onChange={onChange}
          type="checkbox" />
        <span>{children}</span>
      </label>
    );
  }
}

ToggleButton.defaultProps = {
  checked: false,
  onChange: function () {},
  checkboxClassName: 'toggle-button'
}

ToggleButton.propTypes = {
  checked: React.PropTypes.bool,
  children: React.PropTypes.node,
  onChange: React.PropTypes.func,

  checkboxClassName: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
}

module.exports = ToggleButton;
