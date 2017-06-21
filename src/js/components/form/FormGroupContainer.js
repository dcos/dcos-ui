import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "../Icon";

const FormGroupContainer = props => {
  let removeButton = null;
  if (props.onRemove != null) {
    removeButton = (
      <div className="form-group-container-action-button-group">
        <Tooltip
          content="Delete"
          maxWidth={300}
          scrollContainer=".gm-scroll-view"
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

FormGroupContainer.propTypes = {
  children: React.PropTypes.node,
  onRemove: React.PropTypes.func
};

module.exports = FormGroupContainer;
