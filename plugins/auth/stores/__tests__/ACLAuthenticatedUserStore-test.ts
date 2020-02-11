import PluginSDK from "PluginSDK";

const cookie = require("cookie");

const SDK = PluginSDK.__getSDK("authentication", { enabled: true });

require("../../SDK").setSDK(SDK);
const ACLAuthenticatedUserStore = require("../ACLAuthenticatedUserStore")
  .default;
const AuthenticationReducer = require("../../Reducer");

PluginSDK.__addReducer("authentication", AuthenticationReducer);

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
      ACLAuthenticatedUserStore.resetPermissions();
    });

    it("returns an empty permissions object", () => {
      expect(ACLAuthenticatedUserStore.getPermissions()).toEqual({});
    });

    it("returns stored permissions", () => {
      userPermissions = [{ rid: "dcos:adminrouter:service:marathon" }];

      const expectedResult = {
        "dcos:adminrouter:service:marathon": {
          rid: "dcos:adminrouter:service:marathon"
        }
      };
      expect(ACLAuthenticatedUserStore.getPermissions()).toEqual(
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
      expect(ACLAuthenticatedUserStore.getPermissions()).toEqual(
        expectedResult
      );
    });
  });
});
