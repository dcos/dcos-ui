import * as React from "react";
import mixin from "reactjs-mixin";
import { Dropdown } from "reactjs-components";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { MountService } from "foundation-ui";
import { routerShape } from "react-router";

import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import SidebarActions from "#SRC/js/events/SidebarActions";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";

function ClusterDropdownTrigger({ onTrigger, children }) {
  return (
    <span className="header-bar-dropdown-trigger" onClick={onTrigger}>
      {children}
    </span>
  );
}
const METHODS_TO_BIND = ["handleItemSelect", "handleTextCopy"];
export default class ClusterDropdown extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isTextCopied: false
    };

    this.store_listeners = [
      {
        name: "metadata",
        events: ["success"],
        listenAlways: false
      },
      {
        name: "summary",
        events: ["success"],
        listenAlways: false
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getClusterName() {
    const states = MesosSummaryStore.get("states");
    let clusterName = null;

    if (states) {
      const lastState = states.lastSuccessful();

      if (lastState) {
        clusterName = lastState.getClusterName();
      }
    }

    return clusterName;
  }

  getPublicIP() {
    const metadata = MetadataStore.get("metadata");

    if (
      typeof metadata !== "object" ||
      metadata.PUBLIC_IPV4 == null ||
      metadata.PUBLIC_IPV4.length === 0
    ) {
      return null;
    }

    return metadata.PUBLIC_IPV4;
  }

  handleTextCopy() {
    this.setState({ isTextCopied: true });
  }

  handleItemSelect() {
    this.setState({ isTextCopied: false });
  }

  getMenuItems() {
    const clusterName = this.getClusterName();
    const copyText = this.state.isTextCopied ? "Copied" : "Copy";
    const publicIP = this.getPublicIP();

    return [
      {
        className: "dropdown-menu-section-header",
        html: <label className="text-overflow">{clusterName}</label>,
        id: "header-cluster-name",
        selectable: false
      },
      {
        className: "user-account-dropdown-menu-public-ip",
        html: (
          <ClipboardTrigger
            className="dropdown-menu-item-padding-surrogate clickable"
            copyText={publicIP}
            onTextCopy={this.handleTextCopy}
          >
            {publicIP}
            <span className="user-account-dropdown-menu-copy-text">
              {copyText}
            </span>
          </ClipboardTrigger>
        ),
        id: "public-ip",
        onClick: this.handleItemSelect
      },
      {
        html: "Overview",
        id: "overview",
        onClick: () => {
          SidebarActions.close();
          this.context.router.push("/cluster/overview");
        }
      },
      {
        html: (
          <MountService.Mount type={"SidebarHeader:SwitchingModalTrigger"} />
        ),
        id: "cluster-linking",
        onClick: () => {
          SidebarActions.close();
          SidebarActions.openClusterLinkingModal();
        }
      },
      {
        className: "dropdown-menu-section-header",
        html: <label>Support</label>,
        id: "header-support",
        selectable: false
      },
      {
        html: "Documentation",
        id: "documentation",
        onClick() {
          SidebarActions.close();
          global.open(MetadataStore.buildDocsURI("/"), "_blank");
        }
      },
      {
        html: "Install CLI",
        id: "install-cli",
        onClick() {
          SidebarActions.close();
          SidebarActions.openCliInstructions();
        }
      }
    ];
  }

  handleItemSelection(item) {
    if (item.onClick) {
      item.onClick();
    }
  }

  render() {
    const clusterName = this.getClusterName();

    return (
      <Dropdown
        trigger={<ClusterDropdownTrigger>{clusterName}</ClusterDropdownTrigger>}
        dropdownMenuClassName="user-account-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="user-account-dropdown-list dropdown-menu-list"
        items={this.getMenuItems()}
        onItemSelection={this.handleItemSelection}
        persistentID="dropdown-trigger"
        transition={true}
      />
    );
  }
}

ClusterDropdown.contextTypes = {
  router: routerShape
};
