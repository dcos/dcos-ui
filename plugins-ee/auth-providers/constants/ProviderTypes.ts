import { i18nMark } from "@lingui/react";
import IconOpenID from "../components/icons/IconOpenID";
import IconSAML from "../components/icons/IconSAML";

export default {
  oidc: {
    description: i18nMark("OpenID Connect"),
    icon: IconOpenID,
    title: i18nMark("OpenID Connect")
  },
  saml: {
    description: i18nMark("SAML 2.0"),
    icon: IconSAML,
    title: i18nMark("SAML")
  }
};
