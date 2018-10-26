import { Trans } from "@lingui/macro";
import React from "react";
import { Tooltip } from "reactjs-components";

import Icon from "../Icon";

const DeleteRowButton = ({ onClick }) => {
  return (
    <Tooltip
      content={<Trans render="span">Delete</Trans>}
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
