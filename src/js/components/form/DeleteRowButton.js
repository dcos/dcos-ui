import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "../Icon";
import StringUtil from "../../utils/StringUtil";
import UserActions from "../../constants/UserActions";

const DeleteRowButton = ({ onClick }) => {
  return (
    <Tooltip
      content={StringUtil.capitalize(UserActions.DELETE)}
      interactive={false}
      maxWidth={300}
      wrapText={true}
    >
      <a className="button button-link button-narrow" onClick={onClick}>
        <Icon id="close" family="tiny" size="tiny" />
      </a>
    </Tooltip>
  );
};

module.exports = DeleteRowButton;
