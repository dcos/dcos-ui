import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Icon } from "@dcos/ui-kit";
import { Dropdown, Tooltip, MenuItem } from "reactjs-components";

import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { actionAllowed, StatusAction, Status } from "../types/Status";

const NodeActionLabels = {
  drain: "Drain"
};

import Node from "#SRC/js/structs/Node";

const MORE = "MORE";

function renderActionsDropdown(
  node: Node,
  actions: MenuItem[],
  handleAction: (action: string) => void
) {
  const wrapHandleAction = (item: MenuItem) => {
    handleAction(String(item.id));
  };

  return (
    <Dropdown
      anchorRight={true}
      buttonClassName="button button-mini button-link"
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      dropdownMenuListItemClassName="clickable"
      wrapperClassName="dropdown flush-bottom table-cell-icon actions-dropdown"
      items={actions}
      persistentID={MORE}
      onItemSelection={wrapHandleAction}
      scrollContainer=".gm-scroll-view"
      scrollContainerParentSelector=".gm-prevented"
      transition={true}
      transitionName="dropdown-menu"
      disabled={node.isDeactivated()}
    />
  );
}

const generateActionsRenderer = (
  handleAction: (node: Node, action: string) => void
) => {
  return (data: Node): React.ReactNode => {
    const status = Status.fromNode(data);
    const actions: MenuItem[] = [];

    actions.push({
      className: "hidden",
      id: MORE,
      selectedHtml: (
        <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
      )
    });

    if (actionAllowed(StatusAction.DRAIN, status)) {
      actions.push({
        id: StatusAction.DRAIN,
        html: <Trans render="span" id={NodeActionLabels.drain} />
      });
    }

    return (
      <Cell>
        <Tooltip content={<Trans render="span">More actions</Trans>}>
          {renderActionsDropdown(data, actions, handleAction.bind(null, data))}
        </Tooltip>
      </Cell>
    );
  };
};

export { generateActionsRenderer };
