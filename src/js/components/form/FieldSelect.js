import React from "react";
import classNames from "classnames/dedupe";
import { omit } from "#SRC/js/utils/Util";

const FieldSelect = props => {
  const { className } = props;
  const classes = classNames("form-control form-control-select", className);

  return (
    <span className={classes}>
      <select {...props} {...omit(props, ["className"])}>
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
  ]),
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = FieldSelect;
