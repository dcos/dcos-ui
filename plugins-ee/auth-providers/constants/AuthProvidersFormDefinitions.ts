import { i18nMark } from "@lingui/react";

const validation = () => true;

export default {
  saml: [
    {
      fieldType: "text",
      name: "id",
      placeholder: "",
      required: true,
      showError: false,
      showLabel: i18nMark("Provider ID"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "description",
      placeholder: "Name",
      required: true,
      showError: false,
      showLabel: i18nMark("Description"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "textarea",
      maxHeight: 100,
      minHeight: 100,
      name: "idp_metadata",
      required: true,
      showError: false,
      showLabel: i18nMark("IdP Metadata"),
      validation,
      value: "",
      writeType: "input"
    },
    {
      fieldType: "text",
      name: "sp_base_url",
      placeholder: "http://",
      required: true,
      showError: false,
      showLabel: i18nMark("Service Provider Base URL"),
      writeType: "input",
      validation,
      value: ""
    }
  ],
  oidc: [
    {
      fieldType: "text",
      name: "id",
      placeholder: "",
      required: true,
      showError: false,
      showLabel: i18nMark("Provider ID"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "description",
      placeholder: "Name",
      required: true,
      showError: false,
      showLabel: i18nMark("Description"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "issuer",
      required: true,
      showError: false,
      showLabel: i18nMark("Issuer"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "base_url",
      placeholder: "http://",
      required: true,
      showError: false,
      showLabel: i18nMark("Base URI"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "client_id",
      required: true,
      showError: false,
      showLabel: i18nMark("Client ID"),
      writeType: "input",
      validation,
      value: ""
    },
    {
      fieldType: "text",
      name: "client_secret",
      required: true,
      showError: false,
      showLabel: i18nMark("Client Secret"),
      writeType: "input",
      validation,
      value: ""
    }
  ]
};
