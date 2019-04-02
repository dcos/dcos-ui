import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Icon } from "@dcos/ui-kit";
import { Dropdown, Tooltip } from "reactjs-components";
import { Hooks } from "#SRC/js/plugin-bridge/PluginSDK";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { isSDKService } from "../utils/ServiceUtil";
import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceActionLabels from "../constants/ServiceActionLabels";
import * as ServiceStatus from "../constants/ServiceStatus";
import ServiceTree from "../structs/ServiceTree";
import { ServiceActionItem } from "../constants/ServiceActionItem";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
const MORE = ServiceActionItem.MORE;
const OPEN = ServiceActionItem.OPEN;
const RESTART = ServiceActionItem.RESTART;
const RESUME = ServiceActionItem.RESUME;
const SCALE = ServiceActionItem.SCALE;
const STOP = ServiceActionItem.STOP;

function hasWebUI(service: Service | Pod | ServiceTree) {
  return (
    service instanceof Service &&
    service.getWebURL() != null &&
    service.getWebURL() !== ""
  );
}

function onActionsItemSelection(
  service: Service | Pod | ServiceTree,
  handleActionDisabledModalOpen: any,
  handleServiceAction: any,
  actionItem: any
): any {
  let containsSDKService = false;

  if (service instanceof ServiceTree) {
    containsSDKService =
      // #findItem will flatten the service tree
      service.findItem((item: any) => {
        return item instanceof Service && isSDKService(item);
      }) != null;
  }

  if (
    actionItem.id !== EDIT &&
    actionItem.id !== DELETE &&
    (containsSDKService || isSDKService(service)) &&
    !Hooks.applyFilter(
      "isEnabledSDKAction",
      actionItem.id === EDIT || actionItem.id === OPEN,
      actionItem.id
    )
  ) {
    handleActionDisabledModalOpen(service, actionItem.id);
  } else {
    handleServiceAction(service, actionItem.id);
  }
}

function renderServiceActionsDropdown(
  service: Service | Pod | ServiceTree,
  actions: any,
  handleActionDisabledModalOpen: any,
  handleServiceAction: any
) {
  return (
    <Dropdown
      anchorRight={true}
      buttonClassName="button button-mini button-link"
      dropdownMenuClassName="dropdown-menu"
      dropdownMenuListClassName="dropdown-menu-list"
      dropdownMenuListItemClassName="clickable"
      wrapperClassName="dropdown flush-bottom table-cell-icon"
      items={actions}
      persistentID={MORE}
      onItemSelection={onActionsItemSelection.bind(
        null,
        service,
        handleActionDisabledModalOpen,
        handleServiceAction
      )}
      scrollContainer=".gm-scroll-view"
      scrollContainerParentSelector=".gm-prevented"
      transition={true}
      transitionName="dropdown-menu"
      disabled={service.getServiceStatus() === (ServiceStatus as any).DELETING}
    />
  );
}

export function actionsRendererFactory(
  handleActionDisabledModalOpen: any,
  handleServiceAction: any
): React.ReactNode {
  return (service: Service | Pod | ServiceTree) => {
    const isGroup = service instanceof ServiceTree;
    const isPod = service instanceof Pod;
    const isSingleInstanceApp = service.getLabels()
      .MARATHON_SINGLE_INSTANCE_APP;
    const instancesCount = service.getInstancesCount();
    const scaleTextID = isGroup
      ? ServiceActionLabels.scale_by
      : ServiceActionLabels[SCALE];
    const isSDK = isSDKService(service);

    const actions = [];

    actions.push({
      className: "hidden",
      id: MORE,
      html: "",
      selectedHtml: (
        <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
      )
    });

    if (hasWebUI(service)) {
      actions.push({
        id: OPEN,
        html: <Trans render="span" id={ServiceActionLabels.open} />
      });
    }

    if (!isGroup) {
      actions.push({
        id: EDIT,
        html: <Trans render="span" id={ServiceActionLabels.edit} />
      });
    }

    // isSingleInstanceApp = Framework main scheduler
    // instancesCount = service instances
    if ((isGroup && instancesCount > 0) || (!isGroup && !isSingleInstanceApp)) {
      actions.push({
        id: SCALE,
        html: <Trans render="span" id={scaleTextID} />
      });
    }

    if (!isPod && !isGroup && instancesCount > 0 && !isSDK) {
      actions.push({
        id: RESTART,
        html: <Trans render="span" id={ServiceActionLabels[RESTART]} />
      });
    }

    if (instancesCount > 0 && !isSDK) {
      actions.push({
        id: STOP,
        html: <Trans render="span" id={ServiceActionLabels[STOP]} />
      });
    }

    if (!isGroup && instancesCount === 0 && !isSDK) {
      actions.push({
        id: RESUME,
        html: <Trans render="span" id={ServiceActionLabels[RESUME]} />
      });
    }

    actions.push({
      id: DELETE,
      html: (
        <Trans
          render="span"
          className="text-danger"
          id={ServiceActionLabels[DELETE]}
        />
      )
    });

    if (service.getServiceStatus() === (ServiceStatus as any).DELETING) {
      return (
        <Cell>
          {renderServiceActionsDropdown(
            service,
            actions,
            handleActionDisabledModalOpen,
            handleServiceAction
          )}
        </Cell>
      );
    }

    return (
      <Cell>
        <Tooltip content={<Trans render="span">More actions</Trans>}>
          {renderServiceActionsDropdown(
            service,
            actions,
            handleActionDisabledModalOpen,
            handleServiceAction
          )}
        </Tooltip>
      </Cell>
    );
  };
}
