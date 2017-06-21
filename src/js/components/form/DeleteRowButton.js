import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "../Icon";

const DeleteRowButton = ({ onClick }) => {
  return (
    <Tooltip
      content="Delete"
      interactive={true}
      maxWidth={300}
      scrollContainer=".gm-scroll-view"
      wrapText={true}
    >
      <a className="button button-link" onClick={onClick}>
        <Icon id="close" family="tiny" size="tiny" />
      </a>
    </Tooltip>
  );
};

module.exports = DeleteRowButton;
