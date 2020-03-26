import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { Modal } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import TabForm from "#SRC/js/components/TabForm";
import Util from "#SRC/js/utils/Util";

import ACLDirectoriesStore from "../stores/ACLDirectoriesStore";
import FieldDefinitions from "../constants/FieldDefinitions";

const BLACKLISTED_FORM_FIELDS = [
  "group-search-base",
  "group-search-filter-template",
  "ssl-tls-configuration",
  "authentication-bind-type",
  "template-bind-type",
  "user-search-base",
  "user-search-filter-template",
  "ca-certs",
  "client-cert",
];

class DirectoryFormModal extends React.Component {
  static defaultProps = {
    changeModalOpenState() {},
    editMode: true,
    model: {},
    onFormSubmit() {},
  };
  static propTypes = {
    changeModalOpenState: PropTypes.func,
    editMode: PropTypes.bool,
    model: PropTypes.object,
    modalOpen: PropTypes.bool.isRequired,
    onFormSubmit: PropTypes.func,
  };
  constructor(...args) {
    super(...args);

    this.state = {
      isCACertRequired: false,
      formData: {
        "ssl-tls-configuration": null,
        "template-bind-type": null,
      },
    };

    this.triggerTabFormSubmit = null;
  }
  handleAddDirectoryClick = () => {
    this.triggerTabFormSubmit();
  };
  handleFormChange = (formData, changeEvent) => {
    const { fieldName, fieldValue } = changeEvent;

    if (
      fieldName === "template-bind-type" ||
      fieldName === "authentication-bind-type"
    ) {
      const selectedOption = fieldValue.find(
        (radioValue) => radioValue.checked
      );

      this.setState({
        formData: {
          ...this.state.formData,
          [fieldName]: selectedOption.name,
        },
      });
    } else if (fieldName === "client-cert") {
      const isCACertRequired =
        fieldValue != null && fieldValue !== "" && fieldValue !== "\n";

      if (isCACertRequired !== this.state.isCACertRequired) {
        this.setState({ isCACertRequired });
      }
    }
  };
  handleFormSubmit = (formData) => {
    ACLDirectoriesStore.addDirectory(this.processFormData(formData));
    this.props.onFormSubmit();
  };

  getFieldValue(fieldName) {
    const defaultValue = "";
    const { model } = this.props;

    if (fieldName === "ssl-tls-configuration") {
      return this.getSSLTLSConfigValue();
    }

    if (fieldName === "authentication-bind-type") {
      return this.getBindTypeValue();
    }

    if (fieldName === "template-bind-type") {
      return this.getTemplateBindTypeValue();
    }

    // Get a nested value if the requested fieldName contains a period.
    if (fieldName.indexOf(".") > 0) {
      return Util.findNestedPropertyInObject(model, fieldName) || defaultValue;
    }

    return model[fieldName] || defaultValue;
  }

  getModalFooter() {
    const { modalDisabled } = this.props;
    let actionText = modalDisabled ? (
      <Trans render="span">Adding...</Trans>
    ) : (
      <Trans render="span">Add Directory</Trans>
    );

    if (this.props.editMode) {
      actionText = modalDisabled ? (
        <Trans render="span">Saving...</Trans>
      ) : (
        <Trans render="span">Save Configuration</Trans>
      );
    }

    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        <button
          className="button button-primary-link flush-left"
          onClick={this.props.changeModalOpenState.bind(null, false)}
          disabled={modalDisabled}
        >
          <Trans render="span">Cancel</Trans>
        </button>
        <button
          className="button button-primary"
          onClick={this.handleAddDirectoryClick.bind(this)}
          disabled={modalDisabled}
        >
          {actionText}
        </button>
      </div>
    );
  }

  getModalHeader() {
    return this.props.editMode ? (
      <Trans render={<ModalHeading />}>Edit Directory</Trans>
    ) : (
      <Trans render={<ModalHeading />}>Add Directory</Trans>
    );
  }

  getSSLTLSConfigValue() {
    if (!this.props.editMode) {
      return "enforce-starttls";
    }

    const { model = {} } = this.props;

    if (model["use-ldaps"]) {
      return "use-ldaps";
    }

    if (model["enforce-starttls"]) {
      return "enforce-starttls";
    }

    return "ssl-tls-configuration-default-value";
  }

  getBindTypeValue() {
    if (this.state.formData["authentication-bind-type"] != null) {
      return this.state.formData["authentication-bind-type"];
    }

    const { model = {}, editMode } = this.props;

    if (!editMode) {
      return "anonymous-bind";
    }

    if (model["lookup-dn"] || model["lookup-password"]) {
      return "ldap-credentials";
    }

    return "anonymous-bind";
  }

  getTemplateBindTypeValue() {
    if (this.state.formData["template-bind-type"] != null) {
      return this.state.formData["template-bind-type"];
    }

    const { model = {}, editMode } = this.props;

    if (!editMode) {
      return "simple-bind-template";
    }

    if (model["user-search"]) {
      return "search-bind";
    }

    return "simple-bind-template";
  }
  getTriggerTabFormSubmit = (submitTrigger) => {
    this.triggerTabFormSubmit = submitTrigger;
  };

  getConnectionDefinition() {
    const { i18n } = this.props;

    const optionalText = i18n._(t`Optional`);

    return [
      [
        {
          fieldType: "text",
          name: "host",
          placeholder: i18n._(FieldDefinitions.host.fieldPlaceholder),
          showLabel: (
            <Trans render="label" id={FieldDefinitions.host.displayName} />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("host"),
        },
        {
          fieldType: "text",
          name: "port",
          placeholder: i18n._(FieldDefinitions.port.fieldPlaceholder),
          showLabel: (
            <Trans render="label" id={FieldDefinitions.port.displayName} />
          ),
          writeType: "input",
          value: this.getFieldValue("port"),
        },
      ],
      {
        buttonClassName: "button-outline button-split-content",
        fieldType: "select",
        formElementClass: "directory-form-encryption-dropdown",
        matchButtonWidth: true,
        name: "ssl-tls-configuration",
        options: [
          {
            html: (
              <div className="button-split-content-wrapper">
                <Trans
                  render="span"
                  className="button-split-content-item"
                  id={FieldDefinitions["use-ldaps"].fieldLabel}
                />
              </div>
            ),
            id: "use-ldaps",
          },
          {
            html: (
              <div className="button-split-content-wrapper">
                <Trans
                  render="span"
                  className="button-split-content-item"
                  id={FieldDefinitions["enforce-starttls"].fieldLabel}
                />
              </div>
            ),
            id: "enforce-starttls",
          },
          {
            html: (
              <div className="button-split-content-wrapper">
                <Trans
                  render="span"
                  className="button-split-content-item"
                  id={
                    FieldDefinitions["ssl-tls-configuration-default-value"]
                      .fieldLabel
                  }
                />
              </div>
            ),
            id: "ssl-tls-configuration-default-value",
          },
        ],
        required: false,
        showLabel: (
          <Trans
            render="label"
            id={FieldDefinitions["ssl-tls-configuration"].displayName}
          />
        ),
        validation() {
          return true;
        },
        value: this.getFieldValue("ssl-tls-configuration"),
        wrapperClassName: "dropdown dropdown-wide",
      },
      {
        fieldType: "textarea",
        name: "client-cert",
        placeholder: i18n._(FieldDefinitions["client-cert"].fieldPlaceholder),
        showLabel: (
          <label>
            <Trans
              render="span"
              id={FieldDefinitions["client-cert"].displayName}
            />{" "}
            ({optionalText})
          </label>
        ),
        writeType: "input",
        validation() {
          return true;
        },
        value: this.getFieldValue("client-cert"),
      },
      {
        fieldType: "textarea",
        name: "ca-certs",
        placeholder: i18n._(FieldDefinitions["ca-certs"].fieldPlaceholder),
        required: this.state.isCACertRequired,
        showLabel: this.getCACertLabel(
          FieldDefinitions["ca-certs"].displayName
        ),
        writeType: "input",
        validation() {
          return true;
        },
        value: this.getFieldValue("ca-certs"),
      },
    ];
  }

  getAuthenticationBindDefinition() {
    const { i18n } = this.props;

    const conditionalAuthenticationBindFields = {
      "anonymous-bind": [],
      "ldap-credentials": [
        {
          fieldType: "text",
          name: "lookup-dn",
          placeholder: i18n._(FieldDefinitions["lookup-dn"].fieldPlaceholder),
          showLabel: (
            <Trans
              render="label"
              id={FieldDefinitions["lookup-dn"].displayName}
            />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("lookup-dn"),
        },
        {
          fieldType: "password",
          name: "lookup-password",
          placeholder: i18n._(
            FieldDefinitions["lookup-password"].fieldPlaceholder
          ),
          showLabel: (
            <Trans
              render="label"
              id={FieldDefinitions["lookup-password"].displayName}
            />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("lookup-password"),
        },
      ],
    };

    return [
      {
        fieldType: "radioButton",
        name: "authentication-bind-type",
        labelClass: "form-control-inline flush-bottom",
        showLabel: (
          <Trans
            render="label"
            id={FieldDefinitions["authentication-bind-type"].displayName}
          />
        ),
        validation() {
          return true;
        },
        value: [
          {
            name: "anonymous-bind",
            label: i18n._(
              FieldDefinitions["authentication-bind-type.anonymous-bind"]
                .displayName
            ),
            checked:
              this.getFieldValue("authentication-bind-type") ===
              "anonymous-bind",
          },
          {
            name: "ldap-credentials",
            label: i18n._(
              FieldDefinitions["authentication-bind-type.ldap-credentials"]
                .displayName
            ),
            checked:
              this.getFieldValue("authentication-bind-type") ===
              "ldap-credentials",
          },
        ],
      },
    ].concat(
      conditionalAuthenticationBindFields[
        this.getFieldValue("authentication-bind-type")
      ] || []
    );
  }

  getTemplateBindDefinition() {
    const { i18n } = this.props;

    const conditionalTemplateBindFields = {
      "simple-bind-template": [
        {
          fieldType: "text",
          name: "dntemplate",
          placeholder: i18n._(FieldDefinitions.dntemplate.fieldPlaceholder),
          showLabel: (
            <Trans
              render="label"
              id={FieldDefinitions.dntemplate.displayName}
            />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("dntemplate"),
        },
      ],
      "search-bind": [
        {
          fieldType: "text",
          name: "user-search-base",
          placeholder: i18n._(
            FieldDefinitions["user-search.search-base"].fieldPlaceholder
          ),
          showLabel: (
            <Trans
              render="label"
              id={FieldDefinitions["user-search.search-base"].displayName}
            />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("user-search.search-base"),
        },
        {
          fieldType: "text",
          name: "user-search-filter-template",
          placeholder: i18n._(
            FieldDefinitions["user-search.search-filter-template"]
              .fieldPlaceholder
          ),
          showLabel: (
            <Trans
              render="label"
              id={
                FieldDefinitions["user-search.search-filter-template"]
                  .displayName
              }
            />
          ),
          writeType: "input",
          validation() {
            return true;
          },
          value: this.getFieldValue("user-search.search-filter-template"),
        },
      ],
    };

    return [
      {
        fieldType: "radioButton",
        name: "template-bind-type",
        labelClass: "form-control-inline flush-bottom",
        showLabel: (
          <Trans
            render="label"
            id={FieldDefinitions["template-bind-type"].displayName}
          />
        ),
        validation() {
          return true;
        },
        value: [
          {
            name: "simple-bind-template",
            label: i18n._(
              FieldDefinitions["template-bind-type.simple-bind-template"]
                .displayName
            ),
            checked:
              this.getFieldValue("template-bind-type") ===
              "simple-bind-template",
          },
          {
            name: "search-bind",
            label: i18n._(
              FieldDefinitions["template-bind-type.search-bind"].displayName
            ),
            checked: this.getFieldValue("template-bind-type") === "search-bind",
          },
        ],
      },
    ].concat(
      conditionalTemplateBindFields[this.getFieldValue("template-bind-type")] ||
        []
    );
  }

  getAuthenticationMethodDefinition() {
    return this.getAuthenticationBindDefinition().concat(
      this.getTemplateBindDefinition()
    );
  }

  getCACertLabel(label) {
    const { i18n } = this.props;
    const optionalText = i18n._(t`Optional`);

    if (!this.state.isCACertRequired) {
      return (
        <label>
          <Trans render="span" id={label} /> ({optionalText})
        </label>
      );
    }

    return <Trans render="label" id={label} />;
  }

  getGroupImportDefinition() {
    const { i18n } = this.props;

    return [
      {
        fieldType: "text",
        name: "group-search-base",
        placeholder: i18n._(
          FieldDefinitions["group-search.search-base"].fieldPlaceholder
        ),
        showLabel: (
          <Trans
            render="label"
            id={FieldDefinitions["group-search.search-base"].displayName}
          />
        ),
        writeType: "input",
        validation() {
          return true;
        },
        value: this.getFieldValue("group-search.search-base"),
      },
      {
        fieldType: "text",
        name: "group-search-filter-template",
        placeholder: i18n._(
          FieldDefinitions["group-search.search-filter-template"]
            .fieldPlaceholder
        ),
        showLabel: (
          <Trans
            render="label"
            id={
              FieldDefinitions["group-search.search-filter-template"]
                .displayName
            }
          />
        ),
        writeType: "input",
        validation() {
          return true;
        },
        value: this.getFieldValue("group-search.search-filter-template"),
      },
    ];
  }

  getModalFormDefinition() {
    const { i18n } = this.props;

    return {
      connection: {
        title: i18n._("Connection"),
        selectValue: "connection",
        definition: this.getConnectionDefinition(),
      },
      "authentication-method": {
        title: i18n._("Authentication"),
        selectValue: "authentication-method",
        definition: this.getAuthenticationMethodDefinition(),
      },
      "group-import": {
        title: i18n._("Group Import (Optional)"),
        selectValue: "group-import",
        definition: this.getGroupImportDefinition(),
      },
    };
  }

  processFormData(formData) {
    const processedData = {
      ...this.props.model,
    };

    // Transform the nested form definition into an object that the API expects.
    Object.keys(formData).forEach((formGroupName) => {
      const fieldGroup = formData[formGroupName];

      Object.keys(fieldGroup).forEach((fieldName) => {
        const fieldValue = fieldGroup[fieldName];

        // This dropdown's value determines two fields, which must be explicitly
        // defined. It is possible for only one to be true, or both to be false.
        if (fieldName === "ssl-tls-configuration") {
          processedData["enforce-starttls"] = fieldValue === "enforce-starttls";
          processedData["use-ldaps"] = fieldValue === "use-ldaps";
        }

        // If either user-search-base or user-search-filter-template are present
        // then we need to explictly set both fields on a nested object, AND
        // set lookup-dn to null.
        if (
          fieldName === "user-search-base" ||
          fieldName === "user-search-filter-template"
        ) {
          // Create the nested object user-search if necessary.
          if (processedData["user-search"] == null) {
            processedData["user-search"] = {};
          }

          if (fieldName === "user-search-base") {
            processedData["user-search"]["search-base"] = fieldValue;
          }

          if (fieldName === "user-search-filter-template") {
            processedData["user-search"]["search-filter-template"] = fieldValue;
          }

          // dntemplate and the user-search fields are mutually exlusive. Thus,
          // dntemplate must be undefined if the preceeding values are present.
          delete processedData.dntemplate;
        }

        // If either group-search-base or group-search-filter-template are
        // present then we need to explictly define a nested object including
        // both fields, even if one is null. We don't create the nested object
        // if both fields are empty.
        if (
          fieldName === "group-search-base" ||
          fieldName === "group-search-filter-template"
        ) {
          const shouldIncludeGroupSearch =
            fieldGroup["group-search-base"] != null ||
            fieldGroup["group-search-filter-template"] != null;

          if (shouldIncludeGroupSearch) {
            // Create the nested object group-search if necessary.
            if (processedData["group-search"] == null) {
              processedData["group-search"] = {};
            }

            if (fieldName === "group-search-base") {
              processedData["group-search"]["search-base"] = fieldValue;
            }

            if (fieldName === "group-search-filter-template") {
              processedData["group-search"][
                "search-filter-template"
              ] = fieldValue;
            }
          }
        }

        if (
          (fieldName === "client-cert" || fieldName === "ca-certs") &&
          fieldValue != null &&
          fieldValue !== ""
        ) {
          processedData[fieldName] = fieldValue;
        }

        // Exclude all blacklisted form fields.
        if (!BLACKLISTED_FORM_FIELDS.includes(fieldName)) {
          processedData[fieldName] = fieldValue;
        }
      });
    });

    return processedData;
  }

  render() {
    return (
      <Modal
        footer={this.getModalFooter()}
        header={this.getModalHeader()}
        modalWrapperClass="multiple-form-modal modal-form"
        onClose={this.props.changeModalOpenState.bind(null, false)}
        open={this.props.modalOpen}
        scrollContainerClass="multiple-form-modal-body"
        closeByBackdropClick={false}
        showHeader={true}
        showFooter={true}
      >
        <TabForm
          definition={this.getModalFormDefinition()}
          onSubmit={this.handleFormSubmit}
          getTriggerSubmit={this.getTriggerTabFormSubmit}
          onChange={this.handleFormChange}
        />
      </Modal>
    );
  }
}

export default withI18n()(DirectoryFormModal);
