import classNames from 'classnames';
import React from 'react';

class ToggleButton extends React.Component {
  render() {
    let {
      checkboxClassName,
      checked,
      children,
      className,
      id,
      onChange
    } = this.props;

    return (
      <span className={classNames(className)}>
        <input
          className={classNames(checkboxClassName)}
          id={id}
          name="checkbox"
          onChange={onChange}
          type="checkbox" />
        <label
          checked={checked}
          htmlFor={id}>
          {children}
        </label>
      </span>
    );
  }
}

ToggleButton.defaultProps = {
  checked: false,
  id: Date.now(),
  onChange: function () {},

  checkboxClassName: 'toggle-button'
}

ToggleButton.propTypes = {
  checked: React.PropTypes.bool,
  children: React.PropTypes.node,
  id: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
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
