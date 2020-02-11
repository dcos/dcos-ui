import PermissionTree from "../PermissionTree";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

let thisInstance;

describe("PermissionTree", () => {
  beforeEach(() => {
    thisInstance = new PermissionTree({
      displayName: "Top Level",
      groupName: "Top Level Group",
      rid: "top",
      items: [
        {
          displayName: "Alpha Item",
          rid: "alpha",
          actions: ["read"]
        },
        {
          rid: "beta",
          name: "Beta Name"
        },
        {
          rid: "gamma",
          items: []
        },
        {
          rid: "delta",
          actions: ["write"],
          items: [
            {
              rid: "foo",
              actions: ["read"]
            },
            {
              rid: "bar"
            }
          ]
        }
      ]
    });
  });

  describe("#constructor", () => {
    it("makes rid available on object", () => {
      expect(thisInstance.rid).toEqual("top");
    });

    it("makes groupName available on object", () => {
      expect(thisInstance.groupName).toEqual("Top Level Group");
    });

    it("defaults to displayName when groupName isn't available", () => {
      expect(thisInstance.getItems()[0].groupName).toEqual("Alpha Item");
    });

    it("uses to rid groupName and displayName isn't available", () => {
      expect(thisInstance.getItems()[1].groupName).toEqual("beta");
    });

    it("makes name available on object", () => {
      expect(thisInstance.name).toEqual("Top Level");
    });

    it("defaults to rid when displayName isn't available", () => {
      expect(thisInstance.getItems()[1].groupName).toEqual("beta");
    });

    it("makes actions available on object", () => {
      expect(thisInstance.getItems()[3].actions).toEqual(["write"]);
    });

    it("accepts nested trees (items)", () => {
      expect(thisInstance.getItems()[0] instanceof PermissionTree).toEqual(
        true
      );
    });

    it("creates a PermissionTree even if it doesn't have items", () => {
      expect(thisInstance.getItems()[1] instanceof PermissionTree).toEqual(
        true
      );
    });
  });

  describe("#collectActions", () => {
    it("collects actions from an array of rids", () => {
      expect(thisInstance.collectActions(["top", "alpha"])).toEqual(["read"]);
    });

    it("returns top level actions if children are not found", () => {
      expect(thisInstance.collectActions(["not", "available"])).toEqual([]);
    });

    it("collects all actions from listed rids", () => {
      expect(thisInstance.collectActions(["top", "delta", "foo"])).toEqual([
        "write",
        "read"
      ]);
    });

    it("returns an empty array for no actions", () => {
      expect(thisInstance.collectActions(["top", "beta"])).toEqual([]);
    });

    it("re-tries child until rid match, and continues after", () => {
      expect(thisInstance.collectActions(["top", "zeta", "alpha"])).toEqual([
        "read"
      ]);
    });
  });

  describe("#collectChildren", () => {
    it("collects children from an array of rids", () => {
      const children = thisInstance.collectChildren(["top", "alpha"]);
      expect(Array.isArray(children)).toEqual(true);
      expect(children[0].rid).toEqual("top");
      expect(children[1].rid).toEqual("alpha");
    });

    it("returns top level permission if children are not found", () => {
      const items = thisInstance.collectChildren(["not", "available"]);
      expect(items.length).toEqual(1);
      expect(items[0].rid).toEqual("top");
    });

    it("re-tries child until rid match, and continues after", () => {
      const children = thisInstance.collectChildren([
        "top",
        "epsilon",
        "delta",
        "foo"
      ]);
      expect(Array.isArray(children)).toEqual(true);
      expect(children[0].rid).toEqual("top");
      expect(children[1].rid).toEqual("delta");
      expect(children[2].rid).toEqual("foo");
    });
  });

  describe("#collectPermissionString", () => {
    it("creates a permission string from an array of rids", () => {
      expect(thisInstance.collectPermissionString(["top", "alpha"])).toEqual(
        "top:alpha"
      );
    });
    it("returns string of top level if children are not found", () => {
      expect(
        thisInstance.collectPermissionString(["not", "available"])
      ).toEqual("top");
    });

    it("re-tries child until rid match, and continues after", () => {
      expect(
        thisInstance.collectPermissionString(["top", "zeta", "alpha"])
      ).toEqual("top:alpha");
    });
  });
});
