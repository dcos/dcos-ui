import Account from "../../../structs/Account";
import GroupsList from "../../groups/structs/GroupsList";

export default class ServiceAccount extends Account {
  // NOTE: getGroups cannot be moved to Account because of circular
  // reference issues
  getGroups() {
    const groups = this.get("groups") || [];
    const items = groups.map((groupMembership) => groupMembership.group);

    return new GroupsList({ items });
  }

  getDescription() {
    return this.get("description");
  }

  getPublicKey() {
    return this.get("public_key");
  }

  getDetails() {
    return {
      ID: this.getID(),
      Description: this.getDescription(),
      "Public Key": this.getPublicKey() || "N/A",
    };
  }
}
