import { Trans } from "@lingui/macro";
import React from "react";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXxs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const DeleteRowButton = ({ onClick }) => {
  return (
    <Tooltip
      content={<Trans render="span">Delete</Trans>}
      interactive={false}
      maxWidth={300}
      wrapText={true}
    >
      <a className="button button-link button-narrow" onClick={onClick}>
        <Icon shape={SystemIcons.Close} size={iconSizeXxs} />
      </a>
    </Tooltip>
  );
};

module.exports = DeleteRowButton;
