import Item from "#SRC/js/structs/Item";

function reduceAcls(acls, match, accumulator) {
  acls.forEach(acl => {
    if (!match || match.test(acl.rid)) {
      accumulator[acl.aclurl] = acl;
    }
  });
}

class Account extends Item {
  getDescription() {
    return this.get("description");
  }

  getID() {
    return this.get("uid");
  }

  getDetails() {
    return {
      ID: this.getID(),
      Description: this.getDescription()
    };
  }

  getPermissions() {
    return this.get("permissions");
  }

  getUniquePermissions(match = null) {
    const permissions = this.getPermissions();

    if (permissions == null) {
      return [];
    }

    const groupDescriptions = this.getGroups().reduceItems((acc, group) => {
      acc[group.getGID()] = group.getDescription();

      return acc;
    }, {});

    const aclurls = {};

    if (permissions.groups) {
      reduceAcls(permissions.groups, match, aclurls);
    }

    // Add group description for rendering purposes
    Object.keys(aclurls).forEach(aclurl => {
      const acl = aclurls[aclurl];
      acl.groupDescription = groupDescriptions[acl.gid];
    });

    if (permissions.direct) {
      reduceAcls(permissions.direct, match, aclurls);
    }

    return Object.keys(aclurls).map(aclurl => aclurls[aclurl]);
  }
}

export default Account;
