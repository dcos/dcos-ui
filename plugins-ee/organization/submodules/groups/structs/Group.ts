import Item from "#SRC/js/structs/Item";

import ServiceAccountList from "../../service-accounts/structs/ServiceAccountList";

export default class Group extends Item {
  getPermissions(match = null) {
    const permissions = this.get("permissions");

    if (!match) {
      return permissions;
    }

    return permissions.filter(acl => {
      if (!match.test(acl.rid)) {
        return false;
      }

      return true;
    });
  }

  getDescription() {
    return this.get("description");
  }

  getGID() {
    return this.get("gid");
  }

  getServiceAccounts() {
    const serviceAccounts = this.get("serviceAccounts");
    const items = serviceAccounts.map(account => account.user);

    return new ServiceAccountList({ items });
  }
}
