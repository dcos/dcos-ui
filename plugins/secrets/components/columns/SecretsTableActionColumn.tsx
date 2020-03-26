import * as React from "react";
import { Trans } from "@lingui/macro";
import { Dropdown } from "reactjs-components";
import { Icon, Cell } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  spaceM,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Secret from "../../structs/Secret";

const dropdownItems = [
  { html: <Trans className="text-danger">Delete</Trans>, id: "delete" },
];

const DeleteDropdownTrigger = ({
  children,
  onTrigger,
}: {
  children: React.ReactNode;
  onTrigger?: any;
}) => <div onClick={onTrigger}>{children}</div>;

const onDelete = (handleDelete: (secret: Secret) => void, secret: Secret) => {
  handleDelete(secret);
};

export const actionsWidth = () =>
  parseInt(iconSizeXs, 10) + parseInt(spaceM, 10);

export const actionsRenderer = (handleDelete: () => void, secret: any) => {
  return (
    <Cell>
      <Dropdown
        anchorRight={true}
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        items={dropdownItems}
        trigger={
          <DeleteDropdownTrigger>
            <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
          </DeleteDropdownTrigger>
        }
        onItemSelection={onDelete.bind(null, handleDelete, secret)}
        transition={true}
        wrapperClassName="dropdown"
      />
    </Cell>
  );
};
