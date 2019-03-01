import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";
import classNames from "classnames";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXxs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const FormGroupContainer = props => {
  let removeButton = null;
  if (props.onRemove != null) {
    removeButton = (
      <div className="form-group-container-action-button-group">
        <Tooltip
          content={<Trans render="span">Delete</Trans>}
          maxWidth={300}
          wrapText={true}
        >
          <a className="button button-primary-link" onClick={props.onRemove}>
            <Icon
              shape={SystemIcons.Close}
              color={greyDark}
              size={iconSizeXxs}
            />
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
  children: PropTypes.node,
  onRemove: PropTypes.func,
  onClick: PropTypes.func
};

module.exports = FormGroupContainer;
