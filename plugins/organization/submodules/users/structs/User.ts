import Account from "../../../structs/Account";

import GroupsList from "../../groups/structs/GroupsList";

export default class User extends Account {
  // NOTE: getGroups cannot be moved to Account because of circular
  // reference issues
  getGroups() {
    const groups = this.get("groups") || [];
    const items = groups.map((groupMembership) => groupMembership.group);

    return new GroupsList({ items });
  }

  isRemote() {
    return this.get("is_remote");
  }
}
