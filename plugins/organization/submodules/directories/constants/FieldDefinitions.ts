import { i18nMark } from "@lingui/react";

export default {
  host: {
    displayName: i18nMark("Host"),
    fieldPlaceholder: i18nMark("Host"),
  },
  port: {
    displayName: i18nMark("Port"),
    fieldPlaceholder: i18nMark("Port"),
  },
  dntemplate: {
    displayName: i18nMark("User DN Template"),
    fieldPlaceholder: i18nMark("User DN Template"),
  },
  "lookup-dn": {
    displayName: i18nMark("Lookup DN"),
    fieldPlaceholder: i18nMark("Lookup DN"),
  },
  "lookup-password": {
    displayName: i18nMark("Lookup Password"),
    fieldPlaceholder: i18nMark("Lookup Password"),
  },
  "use-ldaps": {
    displayName: i18nMark("Use SSL/TLS for all connections"),
    fieldLabel: i18nMark("Use SSL/TLS for all connections"),
  },
  "enforce-starttls": {
    displayName: i18nMark("Enforce StartTLS for all connections"),
    fieldLabel: i18nMark("Attempt StartTLS, abort if it fails"),
  },
  "ssl-tls-configuration-default-value": {
    displayName: i18nMark("Attempt StartTLS, proceed unencrypted if it fails"),
    fieldLabel: i18nMark("Attempt StartTLS, proceed unencrypted if it fails"),
  },
  "ssl-tls-configuration": {
    displayName: i18nMark("Select SSL/TLS setting"),
  },
  "ca-certs": {
    displayName: i18nMark("CA certificate chain"),
    fieldPlaceholder: i18nMark(
      "If a client certificate is added, a CA certificate chain is required."
    ),
  },
  "client-cert": {
    displayName: i18nMark("Client certificate and private key"),
    fieldPlaceholder: i18nMark("Copy and paste client certificate here."),
  },
  "user-search": {
    displayName: i18nMark("User Search"),
  },
  "user-search.search-base": {
    displayName: i18nMark("User Search Base"),
    fieldPlaceholder: i18nMark("User Search Base"),
  },
  "user-search.search-filter-template": {
    displayName: i18nMark("User Search Filter Template"),
    fieldPlaceholder: i18nMark("User Search Filter Template"),
  },
  "group-search": {
    displayName: i18nMark("Group Search"),
  },
  "group-search.search-base": {
    displayName: i18nMark("Group Search Base"),
    fieldPlaceholder: i18nMark("Group Search Base"),
  },
  "group-search.search-filter-template": {
    displayName: i18nMark("Group Search Filter Template"),
    fieldPlaceholder: i18nMark("Group Search Filter Template"),
  },
  "authentication-bind-type": {
    displayName: i18nMark("Bind Type"),
  },
  "authentication-bind-type.anonymous-bind": {
    displayName: i18nMark("Anonymous Bind"),
  },
  "authentication-bind-type.ldap-credentials": {
    displayName: i18nMark("LDAP Credentials"),
  },
  "template-bind-type": {
    displayName: i18nMark("Authentication Method"),
  },
  "template-bind-type.simple-bind-template": {
    displayName: i18nMark("Simple bind"),
  },
  "template-bind-type.search-bind": {
    displayName: i18nMark("Search bind"),
  },
};
