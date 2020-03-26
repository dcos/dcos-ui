import { Trans } from "@lingui/macro";
import * as React from "react";
import mixin from "reactjs-mixin";
import { MountService } from "foundation-ui";
import { routerShape } from "react-router";

import Config from "#SRC/js/config/Config";
import MesosSummaryStore from "#SRC/js/stores/MesosSummaryStore";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import SidebarActions from "#SRC/js/events/SidebarActions";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ClusterDropdown from "./ClusterDropdown";

MountService.MountService.registerComponent(
  ClusterDropdown,
  "Header:ClusterDropdown"
);

export default class ClusterHeader extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners = [
      { name: "metadata", events: ["success"], unmountWhen: () => true },
      { name: "summary", events: ["success"], unmountWhen: (store, event) => event === "success" && store.get("statesProcessed") }
    ];
  }

  getClusterName() {
    const name = MesosSummaryStore.get("states").getClusterName();
    return name || <Trans render="span">Cluster</Trans>;
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

  getMenuItems() {
    const clusterName = this.getClusterName();
    const publicIP = this.getPublicIP();

    return [
      {
        className: "dropdown-menu-section-header",
        html: <label className="text-overflow">{clusterName}</label>,
        id: "header-cluster-name",
        selectable: false,
      },
      {
        className: "user-account-dropdown-menu-public-ip",
        html: (
          <ClipboardTrigger
            className="dropdown-menu-item-padding-surrogate clickable"
            copyText={publicIP}
          >
            {publicIP}
            <Trans
              id="Copy"
              render="span"
              className="user-account-dropdown-menu-copy-text"
            />
          </ClipboardTrigger>
        ),
        id: "public-ip",
      },
      {
        html: <Trans render="span">Overview</Trans>,
        id: "overview",
        onClick: () => {
          this.context.router.push("/cluster/overview");
        },
      },
      {
        html: (
          <MountService.Mount type={"SidebarHeader:SwitchingModalTrigger"} />
        ),
        id: "cluster-linking",
        onClick: () => {
          SidebarActions.openClusterLinkingModal();
        },
      },
      {
        className: "dropdown-menu-section-header",
        html: <Trans render="label">Support</Trans>,
        id: "header-support",
        selectable: false,
      },
      {
        html: <Trans render="span">Support Portal</Trans>,
        id: "support-portal",
        onClick() {
          window.open(Config.supportPortalURI, "_blank");
        },
      },
      {
        html: <Trans render="span">Documentation</Trans>,
        id: "documentation",
        onClick() {
          window.open(MetadataStore.buildDocsURI("/"), "_blank");
        },
      },
      {
        html: <Trans render="span">Install CLI</Trans>,
        id: "install-cli",
        onClick() {
          SidebarActions.openCliInstructions();
        },
      },
    ];
  }

  render() {
    return (
      <MountService.Mount
        type="Header:ClusterDropdown"
        clusterName={this.getClusterName()}
        limit={1}
        menuItems={this.getMenuItems()}
        onUpdate={this.props.onUpdate}
      />
    );
  }
}

ClusterHeader.contextTypes = {
  router: routerShape,
};
