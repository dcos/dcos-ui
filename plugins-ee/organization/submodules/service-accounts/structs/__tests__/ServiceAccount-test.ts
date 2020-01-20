import GroupsList from "../../../groups/structs/GroupsList";
import ServiceAccount from "../ServiceAccount";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

describe("ServiceAccount", () => {
  describe("#getDescription", () => {
    it("returns description", () => {
      const serviceAccount = new ServiceAccount({
        description: "a service account"
      });

      expect(serviceAccount.getDescription()).toBe("a service account");
    });

    it("strips prefixes from description", () => {
      const serviceAccount = new ServiceAccount({
        description: "Service Account"
      });

      expect(serviceAccount.getDescription()).toBe("Service Account");
    });
  });

  describe("#getID", () => {
    it("returns uid", () => {
      const serviceAccount = new ServiceAccount({
        uid: "foobar"
      });

      expect(serviceAccount.getID()).toBe("foobar");
    });
  });

  describe("#getGroups", () => {
    it("returns an instance of GroupsList", () => {
      const serviceAccount = new ServiceAccount({
        groups: [
          {
            membershipurl: "/groups/olis/users/quis",
            group: {
              gid: "ölis",
              url: "/groups/olis",
              description: "藍-遙 遥 悠 遼 Größe"
            }
          }
        ]
      });

      expect(serviceAccount.getGroups() instanceof GroupsList).toBe(true);
    });

    it("returns GroupsList with correct groups", () => {
      const serviceAccount = new ServiceAccount({
        groups: [
          {
            membershipurl: "/groups/olis/users/quis",
            group: {
              gid: "ölis",
              url: "/groups/olis",
              description: "藍-遙 遥 悠 遼 Größe"
            }
          },
          {
            membershipurl: "/groups/mats/users/quis",
            group: {
              gid: "mats",
              url: "/groups/mats",
              description: "mats group"
            }
          }
        ]
      });

      expect(serviceAccount.getGroups().getItems().length).toEqual(2);
      expect(
        serviceAccount
          .getGroups()
          .getItems()[0]
          .get("gid")
      ).toEqual("ölis");
      expect(
        serviceAccount
          .getGroups()
          .getItems()[1]
          .get("gid")
      ).toEqual("mats");
    });
  });

  describe("#getPermissions", () => {
    it("returns the permissions it was given", () => {
      const permissions = {
        direct: [
          { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" },
          { rid: "dcos:qux:beez", aclurl: "dcos:qux:beez" }
        ],
        groups: [{ rid: "dcos:foo:bar/baz", aclurl: "dcos:foo:bar/baz" }]
      };
      const serviceAccount = new ServiceAccount({ permissions });

      expect(serviceAccount.getPermissions()).toEqual(permissions);
    });
  });

  describe("#getUniquePermissions", () => {
    it("returns an array of services", () => {
      const serviceAccount = new ServiceAccount({
        permissions: {
          direct: [
            { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" },
            { rid: "dcos:qux:beez", aclurl: "dcos:qux:beez" }
          ],
          groups: [{ rid: "dcos:foo:bar/baz", aclurl: "dcos:foo:bar/baz" }]
        }
      });
      const permissionList = serviceAccount.getUniquePermissions();

      expect(permissionList.length).toEqual(3);
      expect(permissionList[0].rid).toEqual("dcos:foo:bar/baz");
    });

    it("returns empty array when user has no permissions", () => {
      const serviceAccount = new ServiceAccount([]);
      const permissionList = serviceAccount.getUniquePermissions();

      expect(permissionList).toEqual([]);
    });

    it("returns unique array when user has duplicate permissions", () => {
      const serviceAccount = new ServiceAccount({
        uid: "person",
        permissions: {
          direct: [
            { aclurl: "service-1" },
            { aclurl: "service-2" },
            { aclurl: "service-3" }
          ],
          groups: [{ aclurl: "service-2" }]
        }
      });

      expect(serviceAccount.getUniquePermissions().length).toEqual(3);
    });

    describe("filters", () => {
      it("filters single permission", () => {
        const serviceAccount = new ServiceAccount({
          permissions: {
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
          }
        });

        expect(serviceAccount.getUniquePermissions(/^dcos:foo:bar$/)).toEqual([
          { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" }
        ]);
      });

      it("filters permissions", () => {
        const serviceAccount = new ServiceAccount({
          permissions: {
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
          }
        });

        expect(serviceAccount.getUniquePermissions(/^dcos:foo:bar/)).toEqual([
          {
            rid: "dcos:foo:bar/baz",
            aclurl: "dcos:foo:bar/baz",
            gid: "geeks"
          },
          { rid: "dcos:foo:bar", aclurl: "dcos:foo:bar" }
        ]);
      });
    });
  });
});
