import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell } from "@dcos/ui-kit";
import { Tooltip } from "reactjs-components";

import Node from "#SRC/js/structs/Node";
import NodeActionsDropdown, {
  getAllowedActions
} from "../components/NodeActionsDropdown";

const generateActionsRenderer = (
  handleAction: (node: Node, action: string) => void
) => {
  return (data: Node): React.ReactNode => {
    const actions = getAllowedActions(data);

    return (
      <Cell>
        {actions.length > 1 ? (
          <Tooltip content={<Trans render="span">Actions</Trans>}>
            <NodeActionsDropdown
              node={data}
              onAction={handleAction.bind(null, data)}
            />
          </Tooltip>
        ) : (
          <span />
        )}
      </Cell>
    );
  };
};

export { generateActionsRenderer };
