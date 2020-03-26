import PluginSDK from "PluginSDK";

const React = require("react");

const ReactDOM = require("react-dom");

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const ACLGroupStore = require("../../stores/ACLGroupStore").default;
const Group = require("../../structs/Group").default;
const GroupAdvancedACLsTab = require("../GroupAdvancedACLsTab").default;
const groupDetailsFixture = require("../../../../../../tests/_fixtures/acl/group-with-details.json");

groupDetailsFixture.permissions = groupDetailsFixture.permissions.array;

let thisGroupStoreGetGroup, thisContainer, thisInstance;

describe("GroupAdvancedACLsTab", () => {
  beforeEach(() => {
    thisGroupStoreGetGroup = ACLGroupStore.getGroup;
    ACLGroupStore.getGroup = (groupID) => {
      if (groupID === "unicode") {
        return new Group(groupDetailsFixture);
      }
    };

    thisContainer = document.createElement("div");
    thisInstance = ReactDOM.render(
      <GroupAdvancedACLsTab itemID={"unicode"} />,
      thisContainer
    );
  });

  afterEach(() => {
    ACLGroupStore.getGroup = thisGroupStoreGetGroup;
    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  describe("#getACLs", () => {
    it("returns empty array", () => {
      ACLGroupStore.getGroup = () => new Group({});
      expect(thisInstance.getACLs()).toEqual([]);
    });

    it("returns acls correctly", () => {
      expect(thisInstance.getACLs()).toEqual([
        {
          rid: "dcos:adminrouter:service:marathon",
          actions: ["full"],
          removable: true,
        },
      ]);
    });
  });
});
