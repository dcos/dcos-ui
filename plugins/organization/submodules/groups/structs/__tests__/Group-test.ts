import Group from "../Group";
import ServiceAccountList from "../../../service-accounts/structs/ServiceAccountList";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);
const groupFixture = require("../../../../../../tests/_fixtures/acl/group-with-details.json");

groupFixture.permissions = groupFixture.permissions.array;
groupFixture.users = groupFixture.users.array;
groupFixture.serviceAccounts = groupFixture.serviceAccounts.array;

let thisGroupFixture, thisInstance;

describe("Group", () => {
  beforeEach(() => {
    thisGroupFixture = {
      ...groupFixture
    };
    thisInstance = new Group(thisGroupFixture);
  });

  describe("#getDescription", () => {
    it("returns the group description", () => {
      expect(thisInstance.getDescription()).toEqual("藍-遙 遥 悠 遼 Größe");
    });
  });

  describe("#getGID", () => {
    it("returns the gid", () => {
      expect(thisInstance.getGID()).toEqual("olis");
    });
  });

  describe("#getPermissions", () => {
    it("returns the permissions it was given", () => {
      expect(thisInstance.getPermissions()).toEqual(
        thisGroupFixture.permissions
      );
    });

    describe("filters", () => {
      beforeEach(() => {
        thisGroupFixture.permissions = [
          { rid: "dcos:foo:bar" },
          { rid: "dcos:foo:bar/baz" },
          { rid: "dcos:qux:beez" }
        ];
        thisInstance = new Group(thisGroupFixture);
      });

      it("filters single permission", () => {
        expect(thisInstance.getPermissions(/^dcos:foo:bar$/)).toEqual([
          { rid: "dcos:foo:bar" }
        ]);
      });

      it("filters permissions", () => {
        expect(thisInstance.getPermissions(/^dcos:foo:bar/)).toEqual([
          { rid: "dcos:foo:bar" },
          { rid: "dcos:foo:bar/baz" }
        ]);
      });
    });
  });

  describe("#getServiceAccounts", () => {
    it("returns an instance of ServiceAccount", () => {
      const serviceAccounts = thisInstance.getServiceAccounts();
      expect(serviceAccounts instanceof ServiceAccountList).toBeTruthy();
    });

    it("returns a ServiceAccountList with the number of items we provided", () => {
      const serviceAccounts = thisInstance.getServiceAccounts().getItems();
      expect(serviceAccounts.length).toEqual(
        thisGroupFixture.serviceAccounts.length
      );
    });

    it("returns a ServiceAccountList with the data we provided", () => {
      const serviceAccounts = thisInstance.getServiceAccounts().getItems();
      expect(serviceAccounts[0].get("uid")).toEqual(
        thisGroupFixture.serviceAccounts[0].user.uid
      );
    });
  });
});
