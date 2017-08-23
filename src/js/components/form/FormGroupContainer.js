/* @flow */
import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "../Icon";
import StringUtil from "../../utils/StringUtil";
import UserActions from "../../constants/UserActions";

type Props = {
  children?: number | string | React.Element | Array<any>,
  onRemove?: Function
};

const FormGroupContainer = (props: Props) => {
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
            <Icon id="close" color="grey" size="tiny" family="tiny" />
          </a>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="panel pod-short">
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

module.exports = FormGroupContainer;
