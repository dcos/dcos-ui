import * as React from "react";
import { shallow } from "enzyme";
import TestRenderer from "react-test-renderer";
import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const List = require("#SRC/js/structs/List").default;
const ACLDirectoriesStore = require("../../stores/ACLDirectoriesStore").default;
const DirectoriesPage = require("../DirectoriesPage").default;

let thisStoreAddDirectory,
  thisStoreGetDirectories,
  thisDirectoryConfig,
  thisInstance;

describe("DirectoriesPage", () => {
  beforeEach(() => {
    thisStoreAddDirectory = ACLDirectoriesStore.addDirectory;
    thisStoreGetDirectories = ACLDirectoriesStore.getDirectories;
    thisDirectoryConfig = {
      host: "foo",
      port: null,
      "lookup-password": "baz",
      "enforce-starttls": false,
      "use-ldaps": true,
      "user-search": {
        "search-base": "qux",
        "search-filter-template": "quux"
      },
      "lookup-dn": null,
      "group-search": {
        "search-base": "corge",
        "search-filter-template": "grault"
      }
    };

    ACLDirectoriesStore.addDirectory = () => {};
    ACLDirectoriesStore.getDirectories = () =>
      new List({ items: [thisDirectoryConfig] });

    thisInstance = shallow(<DirectoriesPage />);
  });

  afterEach(() => {
    ACLDirectoriesStore.addDirectory = thisStoreAddDirectory;
    ACLDirectoriesStore.getDirectories = thisStoreGetDirectories;
  });

  describe("#getDirectoryDetails", () => {
    it("translates the nested user config into a ConfigurationMap component heirarchy with human-friendly labels", () => {
      const configurationMap = TestRenderer.create(
        <div>
          {thisInstance.instance().getDirectoryDetails({
            host: "foo",
            port: "bar",
            "use-ldaps": true,
            "user-search": {
              "search-base": "foo",
              "search-filter-template": "bar"
            }
          })}
        </div>
      );

      expect(configurationMap.toJSON()).toMatchSnapshot();
    });

    it("translates the nested group config into a nested object with human-friendly keys", () => {
      const configurationMap = TestRenderer.create(
        <div>
          {thisInstance.instance().getDirectoryDetails({
            "group-search": {
              "search-base": "foo",
              "search-filter-template": "bar"
            }
          })}
        </div>
      );

      expect(configurationMap.toJSON()).toMatchSnapshot();
    });
  });
});
