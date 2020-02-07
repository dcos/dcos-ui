import * as React from "react";
import { mount, shallow } from "enzyme";
import JestUtil from "#SRC/js/utils/JestUtil";

import Group from "../../structs/Group";

import PluginTestUtils from "PluginTestUtils";

const SDK = PluginTestUtils.getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLGroupStore = require("../../stores/ACLGroupStore").default;
const GroupDetailPage = require("../GroupDetailPage").default;
const GroupAdvancedACLsTab = require("../GroupAdvancedACLsTab").default;
const OrganizationReducer = require("../../../../Reducer");

PluginTestUtils.addReducer("organization", OrganizationReducer);

const groupDetailsFixture = require("../../../../../../tests/_fixtures/acl/group-with-details.json");

groupDetailsFixture.permissions = groupDetailsFixture.permissions.array;
groupDetailsFixture.users = groupDetailsFixture.users.array;
groupDetailsFixture.serviceAccounts = groupDetailsFixture.serviceAccounts.array;

const { APPLICATION } = SDK.constants;

const WrappedComponent = JestUtil.withI18nProvider(GroupDetailPage);

let thisGroupStoreGetGroup, thisInstance;

describe("GroupDetailPage", () => {
  beforeEach(() => {
    thisGroupStoreGetGroup = ACLGroupStore.getGroup;

    PluginTestUtils.addReducer(APPLICATION, () => ({
      summary: {
        statesProcessed: true
      }
    }));

    ACLGroupStore.getGroup = groupID => {
      if (groupID === "unicode") {
        return new Group(groupDetailsFixture);
      }
    };
    thisInstance = shallow(<GroupDetailPage params={{ groupID: "unicode" }} />);
  });

  afterEach(() => {
    ACLGroupStore.getGroup = thisGroupStoreGetGroup;
  });

  describe("#render", () => {
    it("returns error message if fetch error was received", () => {
      const groupID = "unicode";
      thisInstance = mount(<WrappedComponent params={{ groupID }} />);

      ACLGroupStore.processGroupError({}, groupID);

      expect(
        thisInstance
          .render()
          .find("h3")
          .text()
      ).toEqual(
        "DC/OS UI cannot retrieve the requested information at this moment."
      );
    });

    it("shows loading screen if still waiting on Store", () => {
      PluginTestUtils.addReducer(APPLICATION, () => ({
        summary: {
          statesProcessed: false
        }
      }));
      const groupID = "unicode";
      thisInstance = mount(<WrappedComponent params={{ groupID }} />);

      expect(thisInstance.find(".ball-scale").exists()).toBeTruthy();
    });

    it("returns no error message or loading screen if group is found", () => {
      const groupID = "unicode";

      thisInstance = mount(<WrappedComponent params={{ groupID }} />);
      expect(thisInstance.find(GroupAdvancedACLsTab).exists()).toBeTruthy();
    });
  });
});
