import mixin from "reactjs-mixin";
import { MountService } from "foundation-ui";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import AuthStore from "#SRC/js/stores/AuthStore";
import UserAccountDropdownTrigger from "#SRC/js/components/UserAccountDropdownTrigger";
import UserAccountDropdownTriggerContent from "#SRC/js/components/UserAccountDropdownTriggerContent";

import ClipboardTrigger from "./ClipboardTrigger";
import MetadataStore from "../stores/MetadataStore";
import MesosSummaryStore from "../stores/MesosSummaryStore";
import SidebarActions from "../events/SidebarActions";
import UserAccountDropdown from "./UserAccountDropdown";

const METHODS_TO_BIND = ["handleItemSelect", "handleTextCopy"];

class SidebarHeader extends mixin(StoreMixin) {
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

    MountService.MountService.registerComponent(
      UserAccountDropdown,
      "Sidebar:UserAccountDropdown"
    );
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

  getUserLabel() {
    const user = AuthStore.getUser();

    if (user && !user.is_remote) {
      return user.description;
    } else if (user && user.is_remote) {
      return user.uid;
    }

    return null;
  }
  render() {
    const clusterName = this.getClusterName();
    const copyText = this.state.isTextCopied ? "Copied" : "Copy";
    const publicIP = this.getPublicIP();
    const menuItems = [
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

    console.log("user", this.getUserLabel());
    console.log("cluster", this.getClusterName());

    return (
      <MountService.Mount
        type="Sidebar:UserAccountDropdown"
        limit={1}
        menuItems={menuItems}
        onUpdate={this.props.onUpdate}
      >
        <UserAccountDropdownTrigger>
          <UserAccountDropdownTriggerContent
            primaryContent={this.getClusterName()}
            secondaryContent={this.getUserLabel()}
          />
        </UserAccountDropdownTrigger>
      </MountService.Mount>
    );
  }
}

SidebarHeader.contextTypes = {
  router: routerShape
};

module.exports = SidebarHeader;
