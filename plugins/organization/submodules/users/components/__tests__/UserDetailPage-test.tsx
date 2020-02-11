import * as React from "react";
import { shallow, mount } from "enzyme";

import JestUtil from "#SRC/js/utils/JestUtil";
import User from "../../structs/User";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);
const UserDetailPage = require("../UserDetailPage").default;
const AccountAdvancedACLsTab = require("../../../../components/AccountAdvancedACLsTab")
  .default;
const ACLUserStore = require("../../stores/ACLUserStore").default;
const OrganizationReducer = require("../../../../Reducer");

PluginSDK.__addReducer("organization", OrganizationReducer);

const userDetailsFixture = require("../../../../../../tests/_fixtures/acl/user-with-details.json");

userDetailsFixture.groups = userDetailsFixture.groups.array;

const { APPLICATION } = SDK.constants;

const WrappedComponent = JestUtil.withI18nProvider(UserDetailPage);

let thisUserStoreGetUser;

describe("UserDetailPage", () => {
  beforeEach(() => {
    thisUserStoreGetUser = ACLUserStore.getUser;

    PluginSDK.__addReducer(APPLICATION, () => ({
      summary: {
        statesProcessed: true
      }
    }));

    ACLUserStore.getUser = userID => {
      if (userID === "unicode") {
        return new User(userDetailsFixture);
      }
    };
  });

  afterEach(() => {
    ACLUserStore.getUser = thisUserStoreGetUser;
  });

  describe("#onAclUserStoreFetchedDetailsError", () => {
    it("sets fetchedDetailsError if called with same id", () => {
      const userID = "unicode";
      const instance = shallow(<UserDetailPage params={{ userID }} />);
      instance.instance().onAclUserStoreFetchedDetailsError(userID);
      expect(instance.state("fetchedDetailsError")).toBeTruthy();
    });

    it("doesnt set fetchedDetailsError if called with same id", () => {
      const userID = "unicode";
      const instance = shallow(<UserDetailPage params={{ userID }} />);
      instance.instance().onAclUserStoreFetchedDetailsError("otherId");
      expect(instance.state("fetchedDetailsError")).toBeFalsy();
    });
  });

  describe("#render", () => {
    it("returns error message if fetch error was received", () => {
      const userID = "unicode";
      const instance = mount(<WrappedComponent params={{ userID }} />);

      ACLUserStore.processUserError(userID);

      expect(
        instance
          .find(UserDetailPage)
          .render()
          .find("h3")
          .text()
      ).toEqual(
        "DC/OS UI cannot retrieve the requested information at this moment."
      );
    });

    it("shows loading screen if still waiting on Store", () => {
      PluginSDK.__addReducer(APPLICATION, () => ({
        summary: {
          statesProcessed: false
        }
      }));

      const userID = "unicode";
      const instance = mount(<WrappedComponent params={{ userID }} />);

      expect(instance.find(".ball-scale").exists()).toBeTruthy();
    });

    it("return no error message or loading screen if user is found", () => {
      const userID = "unicode";
      const instance = mount(<WrappedComponent params={{ userID }} />);

      expect(instance.find(AccountAdvancedACLsTab).exists()).toBeTruthy();
    });
  });
});
