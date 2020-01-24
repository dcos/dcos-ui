import { MountService as MService } from "foundation-ui";

import PluginTestUtils from "PluginTestUtils";

jest.mock("react-router");

const SDK = PluginTestUtils.getSDK("authentication", { enabled: true });

require("../SDK").setSDK(SDK);
require("react");

const { MountService } = MService;

const ACLAuthenticatedUserStore = require("../stores/ACLAuthenticatedUserStore")
  .default;
const AuthenticationReducer = require("../Reducer");
const AuthHooks = require("../hooks");
const AuthenticatedUserAccountDropdown = require("../components/AuthenticatedUserAccountDropdown")
  .default;
const AuthenticatedClusterDropdown = require("../components/AuthenticatedClusterDropdown")
  .default;

PluginTestUtils.addReducer("authentication", AuthenticationReducer);

AuthHooks.initialize();

let thisHooks, thisCachedGetPermissions, thisMenuItems;

describe("AuthHooks", () => {
  describe("#initialize", () => {
    beforeEach(() => {
      thisHooks = SDK.Hooks;

      SDK.Hooks = {
        addAction: jest.fn(),
        addFilter: jest.fn()
      };

      MountService.unregisterComponent(
        AuthenticatedUserAccountDropdown,
        "Header:UserAccountDropdown"
      );

      MountService.unregisterComponent(
        AuthenticatedClusterDropdown,
        "Header:ClusterDropdown"
      );

      AuthHooks.initialize();
    });

    afterEach(() => {
      SDK.Hooks = thisHooks;
    });

    it("adds sidebarNavigation filter with high priority", () => {
      let foundCall = null;
      SDK.Hooks.addFilter.mock.calls.forEach(call => {
        if (call[0] === "sidebarNavigation") {
          foundCall = call;
        }
      });

      expect(!!foundCall).toBeTruthy();
      expect(foundCall[2]).toBeGreaterThan(100);
    });
  });

  describe("#hasCapability", () => {
    beforeEach(() => {
      thisCachedGetPermissions = ACLAuthenticatedUserStore.getPermissions;
    });

    afterEach(() => {
      ACLAuthenticatedUserStore.getPermissions = thisCachedGetPermissions;
    });

    it("dissallows access to empty capability", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks.hasCapability(false, "")).toBeFalsy();
      expect(AuthHooks.hasCapability(false, null)).toBeFalsy();
    });

    it("allow all capabilities for superusers", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks.hasCapability(false, "foo")).toBeTruthy();
      expect(AuthHooks.hasCapability(false, "bar")).toBeTruthy();
    });

    it("returns truthy when acl is present", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:adminrouter:ops:mesos": {}
      });

      expect(AuthHooks.hasCapability(false, "mesosAPI")).toBeTruthy();
    });

    it("returns falsy when acl is not present", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:adminrouter:ops:mesos": {}
      });

      expect(AuthHooks.hasCapability(false, "networkingAPI")).toBeFalsy();
    });
  });

  describe("#hasCapability", () => {
    beforeEach(() => {
      thisCachedGetPermissions = ACLAuthenticatedUserStore.getPermissions;
      thisMenuItems = [
        "/dashboard",
        "/services",
        "/jobs",
        "/catalog",
        "/nodes",
        "/networking",
        "/secrets",
        "/cluster",
        "/components",
        "/settings",
        "/organization"
      ];
    });

    afterEach(() => {
      ACLAuthenticatedUserStore.getPermissions = thisCachedGetPermissions;
    });

    it("allows access to all menus if superuser", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks.sidebarNavigation(thisMenuItems)).toEqual([
        "/dashboard",
        "/services",
        "/jobs",
        "/catalog",
        "/nodes",
        "/networking",
        "/secrets",
        "/cluster",
        "/components",
        "/settings",
        "/organization"
      ]);
    });

    it("allows items with 'none' permission", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({});

      expect(AuthHooks.sidebarNavigation(thisMenuItems)).toEqual([
        "/secrets",
        "/settings"
      ]);
    });

    it("allows single menu item given permission", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:adminrouter:ops:networking": {}
      });

      expect(AuthHooks.sidebarNavigation(thisMenuItems)).toEqual([
        "/networking",
        "/secrets", // always shown due to 'none permission
        "/settings"
      ]);
    });

    it("allows multiple menu items given permissions", () => {
      ACLAuthenticatedUserStore.getPermissions = () => ({
        "dcos:adminrouter:service:marathon": {},
        "dcos:adminrouter:ops:networking": {}
      });

      expect(AuthHooks.sidebarNavigation(thisMenuItems)).toEqual([
        "/dashboard",
        "/services",
        "/networking",
        "/secrets", // always shown due to 'none permission
        "/settings"
      ]);
    });
  });
});
