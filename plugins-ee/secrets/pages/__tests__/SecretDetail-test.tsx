import PluginTestUtils from "PluginTestUtils";

jest.mock("#SRC/js/components/Page", () => {
  const Page = ({ children }) => <div>{children}</div>;
  Page.Header = ({ children }) => <div>{children}</div>;

  return Page;
});

const SDK = PluginTestUtils.getSDK("secrets", { enabled: true });
require("../../SDK").setSDK(SDK);

const React = require("react");
const renderer = require("react-test-renderer");
const Secret = require("../../structs/Secret").default;
const getSecretStore = require("../../stores/SecretStore").default;

const SecretDetail = require("../SecretDetail").default;

const SecretStore = getSecretStore();

describe("SecretDetail", () => {
  describe("with a secret", () => {
    beforeEach(function() {
      this.fetchSecret = SecretStore.fetchSecret;
      this.getSecretDetail = SecretStore.getSecretDetail;

      SecretStore.fetchSecret = () => [];
      SecretStore.getSecretDetail = () => new Secret();
    });

    afterEach(function() {
      SecretStore.fetchSecret = this.fetchSecret;
      SecretStore.getSecretDetail = this.getSecretDetail;
    });

    it("displays secrets details", function() {
      this.rendered = renderer.create(
        <SecretDetail params={{ secretPath: "/secret" }} />
      );
      this.rendered.getInstance().onSecretsStoreSecretDetailSuccess();

      const tree = this.rendered.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe("with secret store error", () => {
    beforeEach(function() {
      this.fetchSecret = SecretStore.fetchSecret;
      this.getSecretDetail = SecretStore.getSecretDetail;

      SecretStore.fetchSecret = () => null;
      SecretStore.getSecretDetail = () => null;
    });

    afterEach(function() {
      SecretStore.fetchSecret = this.fetchSecret;
      SecretStore.getSecretDetail = this.getSecretDetail;
    });

    it("displays RequestErrorMsg for default error", function() {
      this.rendered = renderer.create(
        <SecretDetail params={{ secretPath: "/secret" }} />
      );
      this.rendered.getInstance().onSecretsStoreSecretDetailError();

      const tree = this.rendered.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it("displays PermissionError for 403", function() {
      this.rendered = renderer.create(
        <SecretDetail params={{ secretPath: "/secret" }} />
      );
      this.rendered
        .getInstance()
        .onSecretsStoreSecretDetailError({ code: 403 });

      const tree = this.rendered.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
