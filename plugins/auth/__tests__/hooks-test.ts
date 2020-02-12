import { MountService as MService } from "foundation-ui";
import PluginSDK from "PluginSDK";
import AuthenticationReducer from "../Reducer";
import ACLAuthenticatedUserStore from "../stores/ACLAuthenticatedUserStore";
import AuthHooks from "../hooks";
import AuthenticatedUserAccountDropdown from "../components/AuthenticatedUserAccountDropdown";
import AuthenticatedClusterDropdown from "../components/AuthenticatedClusterDropdown";

jest.mock("react-router");

const SDK = PluginSDK.__getSDK("authentication", { enabled: true });
const { MountService } = MService;

PluginSDK.__addReducer("authentication", AuthenticationReducer);

AuthHooks(SDK).initialize();

let thisCachedGetPermissions, thisMenuItems;

describe("AuthHooks", () => {
  describe("#initialize", () => {
    beforeEach(() => {
      MountService.unregisterComponent(
        AuthenticatedUserAccountDropdown,
        "Header:UserAccountDropdown"
      );

      MountService.unregisterComponent(
        AuthenticatedClusterDropdown,
        "Header:ClusterDropdown"
      );

      AuthHooks(SDK).initialize();
    });
  });

  describe("#hasCapability", () => {
    beforeEach(() => {
      thisCachedGetPermissions = ACLAuthenticatedUserStore(SDK).getPermissions;
    });

    afterEach(() => {
      ACLAuthenticatedUserStore(SDK).getPermissions = thisCachedGetPermissions;
    });

    it("dissallows access to empty capability", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks(SDK).hasCapability(false, "")).toBeFalsy();
      expect(AuthHooks(SDK).hasCapability(false, null)).toBeFalsy();
    });

    it("allow all capabilities for superusers", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks(SDK).hasCapability(false, "foo")).toBeTruthy();
      expect(AuthHooks(SDK).hasCapability(false, "bar")).toBeTruthy();
    });

    it("returns truthy when acl is present", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:adminrouter:ops:mesos": {}
      });

      expect(AuthHooks(SDK).hasCapability(false, "mesosAPI")).toBeTruthy();
    });

    it("returns falsy when acl is not present", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:adminrouter:ops:mesos": {}
      });

      expect(AuthHooks(SDK).hasCapability(false, "networkingAPI")).toBeFalsy();
    });
  });

  describe("#hasCapability", () => {
    beforeEach(() => {
      thisCachedGetPermissions = ACLAuthenticatedUserStore(SDK).getPermissions;
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
      ACLAuthenticatedUserStore(SDK).getPermissions = thisCachedGetPermissions;
    });

    it("allows access to all menus if superuser", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:superuser": {}
      });

      expect(AuthHooks(SDK).sidebarNavigation(thisMenuItems)).toEqual([
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
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({});

      expect(AuthHooks(SDK).sidebarNavigation(thisMenuItems)).toEqual([
        "/secrets",
        "/settings"
      ]);
    });

    it("allows single menu item given permission", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:adminrouter:ops:networking": {}
      });

      expect(AuthHooks(SDK).sidebarNavigation(thisMenuItems)).toEqual([
        "/networking",
        "/secrets", // always shown due to 'none permission
        "/settings"
      ]);
    });

    it("allows multiple menu items given permissions", () => {
      ACLAuthenticatedUserStore(SDK).getPermissions = () => ({
        "dcos:adminrouter:service:marathon": {},
        "dcos:adminrouter:ops:networking": {}
      });

      expect(AuthHooks(SDK).sidebarNavigation(thisMenuItems)).toEqual([
        "/dashboard",
        "/services",
        "/networking",
        "/secrets", // always shown due to 'none permission
        "/settings"
      ]);
    });
  });
});
