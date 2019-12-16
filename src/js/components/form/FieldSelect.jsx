import PropTypes from "prop-types";
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
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

export default FieldSelect;
