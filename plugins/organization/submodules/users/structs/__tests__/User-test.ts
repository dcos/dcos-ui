import User from "../User";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);
const userFixture = require("../../../../../../tests/_fixtures/acl/user-with-details.json");

userFixture.groups = userFixture.groups.array;

let thisUserFixture, thisInstance;

describe("User", () => {
  beforeEach(() => {
    // Don't remove this, tests won't pass
    require("../../../../SDK").setSDK(SDK);

    thisUserFixture = {
      ...userFixture
    };
    thisInstance = new User(thisUserFixture);
  });

  describe("#getGroups", () => {
    // it('returns an instance of GroupsList', function () {
    //   var groups = this.instance.getGroups();
    //   expect(groups instanceof GroupsList).toBeTruthy();
    // });

    it("returns a GroupsList with the number of items we provided", () => {
      const groups = thisInstance.getGroups().getItems();
      expect(groups.length).toEqual(2);
    });

    it("returns a GroupsList with the data we provided", () => {
      const groups = thisInstance.getGroups().getItems();
      expect(groups[0].get("gid")).toEqual(thisUserFixture.groups[0].group.gid);
      expect(groups[1].get("gid")).toEqual(thisUserFixture.groups[1].group.gid);
    });
  });

  describe("#getPermissions", () => {
    it("returns the permissions it was given", () => {
      expect(thisInstance.getPermissions()).toEqual(
        thisUserFixture.permissions
      );
    });
  });

  describe("#getUniquePermissions", () => {
    it("returns an array of services user has permission to", () => {
      const permissionList = thisInstance.getUniquePermissions();

      expect(permissionList.length).toEqual(1);
      expect(permissionList[0].rid).toEqual(
        "dcos:adminrouter:service:marathon"
      );
    });

    it("returns empty array when user has no permissions", () => {
      const user = new User([]);
      const permissionList = user.getUniquePermissions();

      expect(permissionList).toEqual([]);
    });

    it("returns unique array when user has duplicate permissions", () => {
      const rawUser = {
        uid: "person",
        permissions: {
          direct: [
            { aclurl: "service-1" },
            { aclurl: "service-2" },
            { aclurl: "service-3" }
          ],
          groups: [{ aclurl: "service-2" }]
        }
      };

      const user = new User(rawUser);
      const permissionList = user.getUniquePermissions();

      expect(permissionList.length).toEqual(3);
    });

    describe("filters", () => {
      beforeEach(() => {
        thisUserFixture.permissions = {
          direct: [
            { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" },
            { rid: "dcos:qux:beez", aclurl: "dcos:qux:beez" }
          ],
          groups: [
            {
              rid: "dcos:foo:bar/baz",
              aclurl: "dcos:foo:bar/baz",
              gid: "geeks"
            }
          ]
        };
        thisInstance = new User(thisUserFixture);
      });

      it("filters single permission", () => {
        expect(thisInstance.getUniquePermissions(/^dcos:foo:bar$/)).toEqual([
          { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" }
        ]);
      });

      it("filters permissions", () => {
        expect(thisInstance.getUniquePermissions(/^dcos:foo:bar/)).toEqual([
          {
            rid: "dcos:foo:bar/baz",
            aclurl: "dcos:foo:bar/baz",
            gid: "geeks",
            groupDescription: "These are the geeks, not the nerds."
          },
          { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" }
        ]);
      });
    });
  });

  describe("#isRemote", () => {
    it("returns if user is remote as a boolean", () => {
      const isRemote = thisInstance.isRemote();
      expect(typeof isRemote).toEqual("boolean");
    });

    it("returns true if user is remote", () => {
      const user = new User({
        is_remote: true
      });

      expect(user.isRemote()).toEqual(true);
    });
  });
});
