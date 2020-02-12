import PluginSDK from "PluginSDK";
import cookie from "cookie";

import ACLAuthenticatedUserStore from "../ACLAuthenticatedUserStore";
import AuthenticationReducer from "../../Reducer";

PluginSDK.__addReducer("authentication", AuthenticationReducer);
const SDK = PluginSDK.__getSDK("authentication", { enabled: true });

let thisCookieParse;
describe("ACLAuthenticatedUserStore", () => {
  let userPermissions = [];
  SDK.Hooks.addFilter("instantiateUserStruct", () => ({
    getUniquePermissions() {
      return userPermissions;
    }
  }));

  beforeEach(() => {
    thisCookieParse = cookie.parse;
    document = { cookie: "" };
  });

  afterEach(() => {
    cookie.parse = thisCookieParse;
  });

  describe("#getPermissions", () => {
    afterEach(() => {
      ACLAuthenticatedUserStore(SDK).resetPermissions();
    });

    it("returns an empty permissions object", () => {
      expect(ACLAuthenticatedUserStore(SDK).getPermissions()).toEqual({});
    });

    it("returns stored permissions", () => {
      userPermissions = [{ rid: "dcos:adminrouter:service:marathon" }];

      const expectedResult = {
        "dcos:adminrouter:service:marathon": {
          rid: "dcos:adminrouter:service:marathon"
        }
      };
      expect(ACLAuthenticatedUserStore(SDK).getPermissions()).toEqual(
        expectedResult
      );
    });

    it("returns unique permissions", () => {
      userPermissions = [
        { rid: "dcos:adminrouter:service:marathon" },
        { rid: "dcos:adminrouter:service:marathon" }
      ];

      const expectedResult = {
        "dcos:adminrouter:service:marathon": {
          rid: "dcos:adminrouter:service:marathon"
        }
      };
      expect(ACLAuthenticatedUserStore(SDK).getPermissions()).toEqual(
        expectedResult
      );
    });
  });
});
