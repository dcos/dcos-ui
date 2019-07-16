import { Dropdown } from "reactjs-components";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

const trigger = (iconID: SystemIcons) => ({
  className: "hidden",
  html: <Icon shape={iconID} size={iconSizeXs} color="currentColor" />,
  id: "trigger"
});

const handleItemSelection = (item: { onItemSelect: () => void }) => {
  if (item.onItemSelect) {
    item.onItemSelect();
  }
};

const getDropdownItemFromComponent = (child: JSX.Element, index: number) => ({
  onItemSelect: child.props.onItemSelect,
  html: child,
  id: index
});

export default ({
  children,
  iconID = SystemIcons.EllipsisVertical,
  actionsDisabled
}: {
  children: JSX.Element | JSX.Element[];
  iconID: SystemIcons;
  actionsDisabled: boolean;
}) => (
  <Dropdown
    anchorRight={true}
    buttonClassName="button button-primary-link button-narrow"
    items={[
      trigger(iconID),
      ...React.Children.map(children, getDropdownItemFromComponent)
    ]}
    onItemSelection={handleItemSelection}
    persistentID="trigger"
    transition={true}
    dropdownMenuClassName="dropdown-menu"
    dropdownMenuListClassName="dropdown-menu-list"
    wrapperClassName="dropdown"
    disabled={actionsDisabled}
  />
);
