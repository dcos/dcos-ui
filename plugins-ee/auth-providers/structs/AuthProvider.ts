import { i18nMark } from "@lingui/react";
import Config from "#SRC/js/config/Config";
import Item from "#SRC/js/structs/Item";

export default class AuthProvider extends Item {
  // SAML
  // OpenID
  getDescription() {
    return this.get("description");
  }

  // We're constructing this in the Reducer
  getID() {
    return this.get("providerID");
  }

  getLoginRedirectURL(target) {
    const providerID = encodeURIComponent(this.getID());
    const providerType = this.getProviderType();
    const query = [`${providerType}-provider=${providerID}`];

    if (target) {
      query.push(`target=${encodeURIComponent(target)}`);
    }

    return `${Config.acsAPIPrefix}/auth/login?${query.join("&")}`;
  }

  // We are injecting this in AuthProviderStore.getProvider
  getProviderType() {
    return this.get("providerType");
  }

  // SAML
  getSPBaseUrl() {
    return this.get("sp_base_url");
  }

  // SAML
  getIDPMetaData() {
    return this.get("idp_metadata");
  }

  // OpenID
  getBaseURI() {
    return this.get("base_url");
  }

  // OpenID
  getIssuer() {
    return this.get("issuer");
  }

  // OpenID
  getClientSecret() {
    return this.get("client_secret");
  }

  // OpenID
  getClientID() {
    return this.get("client_id");
  }

  // SAML
  getCallbackURL() {
    return this.get("callbackURL");
  }

  // SAML
  getSPMetadataURL() {
    return `${Config.rootUrl}${
      Config.acsAPIPrefix
    }/auth/saml/providers/${this.getID()}/sp-metadata`;
  }

  // SAML
  getEntityID() {
    const acsCallback = this.getCallbackURL();

    if (!acsCallback) {
      return null;
    }

    return `${acsCallback.slice(0, acsCallback.lastIndexOf("/"))}/sp-metadata`;
  }

  getDetails() {
    const providerType = this.getProviderType();

    if (providerType === "oidc") {
      return this.getOIDCDetails();
    }
    if (providerType === "saml") {
      return this.getSAMLDetails();
    }

    return null;
  }

  getOIDCDetails() {
    return {
      [i18nMark("Provider ID")]: this.getID(),
      [i18nMark("Description")]: this.getDescription(),
      [i18nMark("Issuer")]: this.getIssuer(),
      [i18nMark("Base URI")]: this.getBaseURI(),
      [i18nMark("Client ID")]: this.getClientID(),
      [i18nMark("Client Secret")]: this.getClientSecret()
    };
  }

  getSAMLDetails() {
    return {
      [i18nMark("Provider ID")]: this.getID(),
      [i18nMark("Description")]: this.getDescription(),
      [i18nMark("Service Provider Base URL")]: this.getSPBaseUrl(),
      [i18nMark("IdP Metadata")]: this.getIDPMetaData()
    };
  }
}
