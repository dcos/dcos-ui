import { Trans } from "@lingui/macro";
import * as React from "react";
import ClusterDropdown from "#SRC/js/components/ClusterDropdown";

const SDK = require("../SDK");

const { Hooks } = SDK.getSDK();

class AuthenticatedClusterDropdown extends ClusterDropdown {
  getFilteredMenuItems() {
    const { menuItems } = this.props;
    const canAccessMesosAPI = Hooks.applyFilter(
      "hasCapability",
      false,
      "mesosAPI"
    );
    const canAccessMetadataAPI = Hooks.applyFilter(
      "hasCapability",
      false,
      "metadataAPI"
    );
    const isSuperAdmin = Hooks.applyFilter(
      "hasCapability",
      false,
      "superadmin"
    );

    if (isSuperAdmin) {
      return menuItems;
    }

    return menuItems
      .filter(item => {
        if (!canAccessMetadataAPI && item.id === "public-ip") {
          return false;
        }

        if (!canAccessMetadataAPI && item.id === "header-cluster-name") {
          return false;
        }

        if (item.id === "overview") {
          return false;
        }

        return true;
      })
      .map(item => {
        // Replace the cluster's name with a generic label if the user can't
        // access one of the APIs that provides the data.
        if (!canAccessMesosAPI && item.id === "header-cluster-name") {
          item.html = <Trans render="label">Cluster</Trans>;
        }

        return item;
      });
  }

  /**
   * Adds the authenticated user's account information to the dropdown items.
   * @return {array} Dropdown menu items.
   * @override
   */
  getMenuItems() {
    return this.getFilteredMenuItems();
  }
}

export default AuthenticatedClusterDropdown;
