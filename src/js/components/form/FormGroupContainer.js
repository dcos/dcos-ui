import React from "react";
import { Tooltip } from "reactjs-components";
import classNames from "classnames";

import Icon from "../Icon";
import StringUtil from "../../utils/StringUtil";
import UserActions from "../../constants/UserActions";

const FormGroupContainer = props => {
  let removeButton = null;
  if (props.onRemove != null) {
    removeButton = (
      <div className="form-group-container-action-button-group">
        <Tooltip
          content={StringUtil.capitalize(UserActions.DELETE)}
          maxWidth={300}
          wrapText={true}
        >
          <a className="button button-primary-link" onClick={props.onRemove}>
            <Icon id="close" color="grey" size="mini" family="mini" />
          </a>
        </Tooltip>
      </div>
    );
  }

  const classes = classNames("panel pod-short", {
    "panel-interactive clickable": props.onClick
  });

  return (
    <div className={classes} onClick={props.onClick}>
      <div className="pod-narrow pod-short">
        {removeButton}
        {props.children}
      </div>
    </div>
  );
};

FormGroupContainer.defaultProps = {
  onRemove: null
};

FormGroupContainer.propTypes = {
  children: React.PropTypes.node,
  onRemove: React.PropTypes.func,
  onClick: React.PropTypes.func
};

module.exports = FormGroupContainer;
