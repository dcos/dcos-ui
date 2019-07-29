import * as React from "react";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Cell, Icon } from "@dcos/ui-kit";
import { Dropdown, Tooltip, MenuItem } from "reactjs-components";

import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Node from "#SRC/js/structs/Node";

import { actionAllowed, StatusAction, Status } from "../types/Status";

const NodeActionLabels = {
  drain: i18nMark("Drain"),
  deactivate: i18nMark("Deactivate"),
  reactivate: i18nMark("Reactivate")
};

const MORE = "MORE";

function renderActionsDropdown(
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
    />
  );
}

const getAllowedActionsForNode = (data: Node) => {
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

  if (actionAllowed(StatusAction.DEACTIVATE, status)) {
    actions.push({
      id: StatusAction.DEACTIVATE,
      html: <Trans render="span" id={NodeActionLabels.deactivate} />
    });
  }

  if (actionAllowed(StatusAction.REACTIVATE, status)) {
    actions.push({
      id: StatusAction.REACTIVATE,
      html: <Trans render="span" id={NodeActionLabels.reactivate} />
    });
  }

  return actions;
};

const generateActionsRenderer = (
  handleAction: (node: Node, action: string) => void
) => {
  return (data: Node): React.ReactNode => {
    const actions = getAllowedActionsForNode(data);

    return (
      <Cell>
        {actions.length > 1 ? (
          <Tooltip content={<Trans render="span">Actions</Trans>}>
            {renderActionsDropdown(actions, handleAction.bind(null, data))}
          </Tooltip>
        ) : (
          <span />
        )}
      </Cell>
    );
  };
};

export { generateActionsRenderer };
