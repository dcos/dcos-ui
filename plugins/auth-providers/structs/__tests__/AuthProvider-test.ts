import AuthProvider from "../AuthProvider";

import PluginSDK from "PluginSDK";

const SDK = PluginSDK.__getSDK("auth-providers", { enabled: true });
require("../../SDK").setSDK(SDK);
const oidcProviderFixture = require("../../../../tests/_fixtures/OpenIDAuthProviders/provider.json");
const samlProviderFixture = require("../../../../tests/_fixtures/SAMLAuthProviders/provider.json");

let thisInstance;

describe("AuthProvider", () => {
  beforeEach(() => {
    thisInstance = {};
    const oidcProvider = {
      ...oidcProviderFixture,
      providerType: "oidc",
    };
    const samlProvider = {
      ...samlProviderFixture,
      providerType: "saml",
    };
    thisInstance.oidc = new AuthProvider(oidcProvider);
    thisInstance.saml = new AuthProvider(samlProvider);
  });

  describe("#getClientSecret", () => {
    it("returns the client_secret", () => {
      expect(thisInstance.oidc.getClientSecret()).toEqual("xyz");
    });
  });

  describe("#getClientID", () => {
    it("returns the client_id", () => {
      expect(thisInstance.oidc.getClientID()).toEqual("google.client.id");
    });
  });

  describe("#getDescription", () => {
    it("returns the oidc description", () => {
      expect(thisInstance.oidc.getDescription()).toEqual("Google description");
    });

    it("returns the saml description", () => {
      expect(thisInstance.saml.getDescription()).toEqual("A SAML provider");
    });
  });

  describe("#getID", () => {
    it("returns the oidc providerID", () => {
      expect(thisInstance.oidc.getID()).toEqual("google");
    });

    it("returns the saml providerID", () => {
      expect(thisInstance.saml.getID()).toEqual("saml_provider_id");
    });
  });

  describe("#getIssuer", () => {
    it("returns the issuer", () => {
      expect(thisInstance.oidc.getIssuer()).toEqual(
        "https://accounts.google.com"
      );
    });
  });

  describe("#getLoginRedirectURL", () => {
    it("returns the login URL for provider", () => {
      expect(thisInstance.oidc.getLoginRedirectURL()).toEqual(
        `/acs/api/v1/auth/login?oidc-provider=${encodeURIComponent("google")}`
      );
    });

    it("adds target param to query", () => {
      expect(thisInstance.oidc.getLoginRedirectURL("fake:target")).toEqual(
        `/acs/api/v1/auth/login?oidc-provider=${encodeURIComponent(
          "google"
        )}&target=fake%3Atarget`
      );
    });
  });

  describe("#getProviderType", () => {
    it("returns the oidc providerType", () => {
      expect(thisInstance.oidc.getProviderType()).toEqual("oidc");
    });

    it("returns the saml providerType", () => {
      expect(thisInstance.saml.getProviderType()).toEqual("saml");
    });
  });

  describe("#getBaseURI", () => {
    it("returns the base_url", () => {
      expect(thisInstance.oidc.getBaseURI()).toEqual(
        "http://cluster.com/callback"
      );
    });
  });

  describe("#getIDPMetaData", () => {
    it("returns the idp idp_metadata", () => {
      expect(thisInstance.saml.getIDPMetaData()).toEqual(
        samlProviderFixture.idp_metadata
      );
    });
  });

  describe("#getSPBaseUrl", () => {
    it("returns the sp_base_url", () => {
      expect(thisInstance.saml.getSPBaseUrl()).toEqual("https://saml.com");
    });
  });

  describe("#getSPMetadataURL", () => {
    it("constructs and returns the SP metadata URL", () => {
      expect(thisInstance.saml.getSPMetadataURL()).toEqual(
        "/acs/api/v1/auth/saml/providers/saml_provider_id/sp-metadata"
      );
    });
  });

  describe("#getEntityID", () => {
    it("constructs and returns the entity ID", () => {
      thisInstance.saml.getCallbackURL = () =>
        "https://callback.co/acs-callback";

      expect(thisInstance.saml.getEntityID()).toEqual(
        "https://callback.co/sp-metadata"
      );
    });

    it("returns null if no callback is defined.", () => {
      thisInstance.saml.getCallbackURL = () => null;

      expect(thisInstance.saml.getEntityID()).toEqual(null);
    });
  });

  describe("#getDetails", () => {
    it("returns oidc details for oidc provider", () => {
      const details = thisInstance.oidc.getDetails();

      expect(details.Issuer).toEqual("https://accounts.google.com");
      expect(details["IdP Metadata"]).toBeFalsy();
    });

    it("returns saml details for saml provider", () => {
      const details = thisInstance.saml.getDetails();

      expect(details["IdP Metadata"]).toEqual(samlProviderFixture.idp_metadata);
      expect(details.Issuer).toBeFalsy();
    });
  });

  describe("#getOIDCDetails", () => {
    it("returns the oidc details", () => {
      expect(thisInstance.oidc.getOIDCDetails()).toEqual({
        "Provider ID": "google",
        Description: "Google description",
        Issuer: "https://accounts.google.com",
        "Client Secret": "xyz",
        "Client ID": "google.client.id",
        "Base URI": "http://cluster.com/callback",
      });
    });
  });

  describe("#getSAMLDetails", () => {
    it("returns the saml details", () => {
      expect(thisInstance.saml.getSAMLDetails()).toEqual({
        "Provider ID": "saml_provider_id",
        Description: "A SAML provider",
        "Service Provider Base URL": "https://saml.com",
        "IdP Metadata": samlProviderFixture.idp_metadata,
      });
    });
  });
});
