import ClusterDropdown from "#SRC/js/components/ClusterDropdown";

class AuthenticatedClusterDropdown extends ClusterDropdown {
  /**
   * Adds the authenticated user's account information to the dropdown items.
   * @return {array} Dropdown menu items.
   * @override
   */
  getMenuItems() {
    return this.props.menuItems;
  }
}

module.exports = AuthenticatedClusterDropdown;
