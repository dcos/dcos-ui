import PluginSDK from "PluginSDK";

import * as React from "react";

import { mount } from "enzyme";

import JestUtil from "#SRC/js/utils/JestUtil";

const SDK = PluginSDK.__getSDK("organization", { enabled: true });
require("../../../../SDK").setSDK(SDK);

const List = require("#SRC/js/structs/List").default;
const ACLDirectoriesStore = require("../../stores/ACLDirectoriesStore").default;
const DirectoryFormModal = require("../DirectoryFormModal").default;

const WrappedComponent = JestUtil.withI18nProvider(DirectoryFormModal);

let thisStoreAddDirectory,
  thisStoreGetDirectories,
  thisDirectoryConfig,
  thisInstance;

describe("DirectoryFormModal", () => {
  beforeEach(() => {
    thisStoreAddDirectory = ACLDirectoriesStore.addDirectory;
    thisStoreGetDirectories = ACLDirectoriesStore.getDirectories;
    thisDirectoryConfig = {
      host: "foo",
      port: null,
      "lookup-username": "bar",
      "lookup-password": "baz",
      "enforce-starttls": false,
      "use-ldaps": true,
      "user-search": {
        "search-base": "qux",
        "search-filter-template": "quux",
      },
      "lookup-dn": null,
      "group-search": {
        "search-base": "corge",
        "search-filter-template": "grault",
      },
    };

    ACLDirectoriesStore.addDirectory = () => {};
    ACLDirectoriesStore.getDirectories = () =>
      new List({ items: [thisDirectoryConfig] });

    thisInstance = mount(
      <WrappedComponent
        modalOpen={true}
        onFormSubmit={() => {}}
        changeModalOpenState={() => {}}
      />
    );
  });

  afterEach(() => {
    ACLDirectoriesStore.addDirectory = thisStoreAddDirectory;
    ACLDirectoriesStore.getDirectories = thisStoreGetDirectories;
  });

  describe("#getFieldValue", () => {
    it("retrieves a value from the model", () => {
      const formModalInstance = mount(
        <WrappedComponent
          model={{ foo: "bar" }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        formModalInstance
          .find("DirectoryFormModal")
          .instance()
          .getFieldValue("foo")
      ).toEqual("bar");
    });

    it("retrieves a nested value from the model", () => {
      const formModalInstance = mount(
        <WrappedComponent
          model={{ foo: { bar: "baz" } }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        formModalInstance
          .find("DirectoryFormModal")
          .instance()
          .getFieldValue("foo.bar")
      ).toEqual("baz");
    });

    it("returns an empty string by default", () => {
      const formModalInstance = mount(
        <WrappedComponent
          model={{}}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        formModalInstance
          .find("DirectoryFormModal")
          .instance()
          .getFieldValue("foo")
      ).toEqual("");
      expect(
        formModalInstance
          .find("DirectoryFormModal")
          .instance()
          .getFieldValue("foo.bar")
      ).toEqual("");
    });
  });

  describe("#getSSLTLSConfigValue", () => {
    it('returns "enforce-starttls" if not in edit mode', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={false}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getSSLTLSConfigValue()
      ).toEqual("enforce-starttls");
    });

    it('returns "ssl-tls-configuration-default-value" if in edit mode and model does not contain the relevant keys', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{}}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getSSLTLSConfigValue()
      ).toEqual("ssl-tls-configuration-default-value");
    });

    it('returns "use-ldaps" if model contains it', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{ "use-ldaps": true }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getSSLTLSConfigValue()
      ).toEqual("use-ldaps");
    });

    it('returns "enforce-starttls" if model contains it', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{ "enforce-starttls": true }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getSSLTLSConfigValue()
      ).toEqual("enforce-starttls");
    });
  });

  describe("#getTemplateBindTypeValue", () => {
    it('returns "simple-bind-template" if not in edit mode', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={false}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getTemplateBindTypeValue()
      ).toEqual("simple-bind-template");
    });

    it('returns "none" if in edit mode and model does not contain the relevant keys', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{}}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getTemplateBindTypeValue()
      ).toEqual("simple-bind-template");
    });

    it('returns "search-bind" if model contains "user-search" key', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{ "user-search": { foo: "bar" } }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getTemplateBindTypeValue()
      ).toEqual("search-bind");
    });

    it("returns value from state if it exists before determining value from model", () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{ "user-search": { foo: "bar" } }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      thisInstance
        .find("DirectoryFormModal")
        .instance()
        .handleFormChange(null, {
          fieldName: "template-bind-type",
          fieldValue: [{ checked: true, name: "foo" }],
        });

      expect(
        thisInstance
          .find("DirectoryFormModal")
          .instance()
          .getTemplateBindTypeValue()
      ).toEqual("foo");
    });
  });

  describe("#getBindTypeValue", () => {
    it('returns "anonymous-bind" if not in edit mode', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={false}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance.find("DirectoryFormModal").instance().getBindTypeValue()
      ).toEqual("anonymous-bind");
    });

    it('returns "anonymous-bind" if in edit mode and model does not contain the relevant keys', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{}}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance.find("DirectoryFormModal").instance().getBindTypeValue()
      ).toEqual("anonymous-bind");
    });

    it('returns "ldap-credentials" if model contains "lookup-dn" key', () => {
      thisInstance = mount(
        <WrappedComponent
          editMode={true}
          model={{ "lookup-dn": "bar" }}
          modalOpen={true}
          onFormSubmit={() => {}}
          changeModalOpenState={() => {}}
        />
      );

      expect(
        thisInstance.find("DirectoryFormModal").instance().getBindTypeValue()
      ).toEqual("ldap-credentials");
    });
  });

  describe("#processFormData", () => {
    it("flattens the nested form data to a single depth", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "account-setup": {
            foo: "bar",
            bar: "baz",
          },
          configuration: {
            baz: "qux",
            quux: "corge",
          },
          "group-import": {
            corge: "grault",
            grault: "garply",
          },
        });

      expect(transformedData).toEqual({
        foo: "bar",
        bar: "baz",
        baz: "qux",
        quux: "corge",
        corge: "grault",
        grault: "garply",
      });
    });

    it("only transforms specific keys", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "account-setup": {
            foo: "bar",
            host: "foo",
            port: "bar",
          },
        });

      expect(transformedData).toEqual({
        foo: "bar",
        host: "foo",
        port: "bar",
      });
    });
    it("transforms ssl-tls-configuration to two falsey keys", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "account-setup": {
            "ssl-tls-configuration": "foo",
          },
        });

      expect(transformedData).toEqual({
        "enforce-starttls": false,
        "use-ldaps": false,
      });
    });
    it("transforms ssl-tls-configuration to proper truthy key", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "account-setup": {
            "ssl-tls-configuration": "enforce-starttls",
          },
        });

      expect(transformedData).toEqual({
        "enforce-starttls": true,
        "use-ldaps": false,
      });
    });
    it("transforms ssl-tls-configuration to proper truthy key", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "account-setup": {
            "ssl-tls-configuration": "use-ldaps",
          },
        });

      expect(transformedData).toEqual({
        "enforce-starttls": false,
        "use-ldaps": true,
      });
    });

    it("transforms the group-import fields in the way the API expects", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          "group-import": {
            "group-search-base": "foo",
            "group-search-filter-template": "bar",
          },
        });

      expect(transformedData).toEqual({
        "group-search": {
          "search-base": "foo",
          "search-filter-template": "bar",
        },
      });
    });

    it("transforms the user-import fields in the way the API expects", () => {
      const transformedData = thisInstance
        .find("DirectoryFormModal")
        .instance()
        .processFormData({
          configuration: {
            "user-search-base": "foo",
            "user-search-filter-template": "bar",
          },
        });

      expect(transformedData).toEqual({
        "user-search": {
          "search-base": "foo",
          "search-filter-template": "bar",
        },
      });
    });
  });
});
