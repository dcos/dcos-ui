import Item from "#SRC/js/structs/Item";

const AUTH_TYPE_SAML_SP_INITIATED = "saml-sp-initiated";
const AUTH_TYPE_OIDC_AUTHORIZATION_CODE_FLOW = "oidc-authorization-code-flow";
const AUTH_TYPE_OIDC_IMPLICIT_FLOW = "oidc-implicit-flow";

export default class Cluster extends Item {
  getName() {
    return this.get("name");
  }

  getUrl() {
    return this.get("url");
  }

  getLoginUrl() {
    const { type = "", id = "" } = this.get("login_provider") || {};

    switch (type) {
      case AUTH_TYPE_SAML_SP_INITIATED:
        return `${this.getUrl()}/acs/api/v1/auth/login?saml-provider=${id}`;
      case AUTH_TYPE_OIDC_AUTHORIZATION_CODE_FLOW:
      case AUTH_TYPE_OIDC_IMPLICIT_FLOW:
        return `${this.getUrl()}/acs/api/v1/auth/login?oidc-provider=${id}`;
    }

    return this.getUrl();
  }
}
