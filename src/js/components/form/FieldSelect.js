import React from "react";

const FieldSelect = props => {
  return (
    <span className="form-control form-control-select">
      <select {...props}>
        {props.children}
      </select>
    </span>
  );
};

FieldSelect.defaultProps = {
  onChange() {},
  value: ""
};

FieldSelect.propTypes = {
  name: React.PropTypes.string,
  onChange: React.PropTypes.func,
  value: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ])
};

module.exports = FieldSelect;
