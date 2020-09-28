import { withI18n, i18nMark } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Modal, Tooltip } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { purpleLighten1 } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldTextarea from "#SRC/js/components/form/FieldTextarea";
import FieldFile from "#SRC/js/components/form/FieldFile";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import PrivatePluginsConfig from "../../PrivatePluginsConfig";
import getSecretStore from "../stores/SecretStore";

const SecretStore = getSecretStore();

const FILE_SIZE_LIMIT_IN_BYTES = 786 * 1024; // 786KB is the max file size

const FileSize = ({ value }) => {
  const sizeInBytes = value.size;
  function toString(num) {
    return num.toLocaleString({ maximumFractionDigits: 3 });
  }

  if (sizeInBytes < 1024) {
    return (
      <Trans
        id="{sizeInBytes} B"
        values={{
          sizeInBytes: toString(sizeInBytes),
        }}
      />
    );
  }

  const sizeInKB = sizeInBytes / 1024;
  if (sizeInKB < 1024) {
    return (
      <Trans
        id="{sizeInKB} kB"
        values={{
          sizeInKB: toString(sizeInKB),
        }}
      />
    );
  }

  const sizeInMB = sizeInKB / 1024;

  return <Trans id="{sizeInMB} MB" values={{ sizeInMB: toString(sizeInMB) }} />;
};

const FileOverview = ({ onDelete, file }) => (
  <FormRow>
    <div className="column-12 secret-file-value flex flex-align-items-center">
      <Icon
        ariaLabel="file"
        shape="system-page-document"
        color={purpleLighten1}
      />

      <span className="flex-item-grow-1 text-overflow flex-item-basis-none">
        {file.name}
      </span>
      <FileSize value={file} />

      <a className="text-danger clickable" onClick={onDelete}>
        <Trans>Remove</Trans>
      </a>
    </div>
  </FormRow>
);

const browserSupportsFileApi = (() => {
  try {
    new File([], "");

    return true;
  } catch (e) {
    return false;
  }
})();

class SecretFormModal extends mixin(StoreMixin) {
  static defaultProps = {
    secret: {},
    onClose() {},
    open: false,
  };
  static propTypes = {
    secret: PropTypes.object,
    onClose: PropTypes.func,
    open: PropTypes.bool,
  };

  state = {
    requestErrorType: null,
    requestErrorMessage: null,
    localErrors: null,
    path: null,
    textValue: null,
    fileValue: null,
    valueType: "text",
    pendingRequest: false,
  };

  // prettier-ignore
  store_listeners = [
    {name: "secrets", events: ["createSecretSuccess", "createSecretError", "updateSecretSuccess", "updateSecretError"]}
  ];

  UNSAFE_componentWillUpdate(nextProps) {
    // Populate state with current secret's values, if provided.
    if (
      nextProps.open &&
      !this.props.open &&
      Object.keys(nextProps.secret).length !== 0
    ) {
      const isBinarySecret = nextProps.secret.isBinary();

      this.setState({
        path: nextProps.secret.path || "",
        textValue: !isBinarySecret ? nextProps.secret.value || "" : "",
        fileValue: isBinarySecret ? nextProps.secret.getValue() : undefined,
        valueType: isBinarySecret ? "file" : "text",
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Reset state when the modal is closing.
    if (this.props.open && !nextProps.open) {
      this.setState({
        requestErrorType: null,
        localErrors: null,
        path: null,
        textValue: null,
        fileValue: null,
        valueType: "text",
        pendingRequest: false,
      });
    }
  }
  onSecretsStoreUpdateSecretSuccess = () => {
    this.setState({ requestErrorType: null });
    SecretStore.fetchSecrets();
    this.props.onClose();
  };
  onSecretsStoreCreateSecretSuccess = () => {
    this.setState({ requestErrorType: null });
    SecretStore.fetchSecrets();
    this.props.onClose();
  };
  onSecretsStoreCreateSecretError = (error) => {
    this.setState({
      ...this.stateFromError(error, "create"),
      pendingRequest: false,
    });
  };
  onSecretsStoreUpdateSecretError = (error) => {
    this.setState({
      ...this.stateFromError(error, "update"),
      pendingRequest: false,
    });
  };

  stateFromError(error, operation) {
    const { i18n } = this.props;

    if (this.isForbiddenError(error)) {
      return {
        requestErrorType: "permission",
        requestErrorMessage:
          i18n._(t`You do not have permission to`) +
          " " +
          operation +
          " " +
          i18n._(
            t`this secret. Please contact your super admin to learn more.`
          ),
      };
    }

    return {
      requestErrorType: "failure",
      requestErrorMessage: i18n._(t`An error has occurred.`),
    };
  }

  isForbiddenError(error) {
    return error && error.status === 403;
  }
  getPathFieldErrors = () => {
    const { i18n } = this.props;
    const { path } = this.state;

    if (path === "" || path == null) {
      return {
        path: i18n._(t`This field is required.`),
      };
    }
    if (!this.isPathValid(path)) {
      return {
        path: i18n._(
          t`Invalid syntax. Cannot use slashes at the beginning or end.`
        ),
      };
    } else if (!this.isValid(path)) {
      return {
        path: i18n._(
          t`Alphanumerical, dashes, underscores and slashes are allowed.`
        ),
      };
    }

    return {};
  };
  getValueFieldErrors = () => {
    const { i18n } = this.props;
    const { textValue } = this.state;

    if (!textValue) {
      return {
        textValue: i18n._(t`This field is required.`),
      };
    }

    return {};
  };
  getFileFieldErrors = () => {
    const { i18n } = this.props;
    const { fileValue } = this.state;

    if (!fileValue) {
      return {
        file: i18n._(t`This field is required.`),
      };
    }

    if (fileValue.size > FILE_SIZE_LIMIT_IN_BYTES) {
      return {
        file: i18n._(t`The maximum file size for a secret is 786KB.`),
      };
    }

    return {};
  };

  getErrorMessage() {
    const { requestErrorType, requestErrorMessage } = this.state;
    const showNotSupportedError = this.denyFileBasedSecret();

    if (requestErrorType && requestErrorMessage) {
      return (
        <React.Fragment>
          <InfoBoxInline appearance="danger" message={requestErrorMessage} />
          <br />
        </React.Fragment>
      );
    }

    if (showNotSupportedError) {
      return (
        <InfoBoxInline
          className="form-group"
          appearance="danger"
          message={
            <Trans>
              This version of your browser does not support updating the file.
              To change the file, you can update your browser, use a different
              browser, or use the CLI.
            </Trans>
          }
        />
      );
    }

    return null;
  }

  getModalFooter() {
    const disableAfirmation = this.denyFileBasedSecret();
    const { pendingRequest } = this.state;
    let affirmCopy = pendingRequest
      ? i18nMark("Creating...")
      : i18nMark("Create Secret");

    if (this.isEditingSecret()) {
      affirmCopy = pendingRequest
        ? i18nMark("Saving...")
        : i18nMark("Save Secret");
    }

    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        <button
          className="button button-primary-link flush-left"
          onClick={this.props.onClose}
        >
          <Trans render="span">Cancel</Trans>
        </button>

        {!disableAfirmation ? (
          <button
            className="button button-primary"
            onClick={this.handleAffirmClick}
            disabled={this.state.pendingRequest}
          >
            <Trans render="span" id={affirmCopy} />
          </button>
        ) : null}
      </div>
    );
  }

  getModalHeading() {
    const title = this.isEditingSecret()
      ? i18nMark("Edit Secret")
      : i18nMark("Create New Secret");

    return (
      <ModalHeading>
        <Trans render="span" id={title} />
      </ModalHeading>
    );
  }

  getPathRow() {
    const { path: fieldValue } = this.state;
    const hasError = Boolean(
      this.state.localErrors && this.state.localErrors.path
    );
    const isDisabled = this.isEditingSecret();

    const formGroup = (
      <FormGroup className="column-12" showError={hasError}>
        <FieldLabel>
          <FormGroupHeading required={true}>
            <Trans
              render={<FormGroupHeadingContent primary={true} title="ID" />}
            >
              ID
            </Trans>
          </FormGroupHeading>
        </FieldLabel>
        <FieldInput disabled={isDisabled} name="path" value={fieldValue} />
        <FieldError>{hasError ? this.state.localErrors.path : null}</FieldError>
      </FormGroup>
    );

    if (isDisabled) {
      return (
        <Tooltip
          content="You cannot edit the ID."
          wrapperClassName="form-row row tooltip-block-wrapper tooltip-wrapper"
        >
          {formGroup}
        </Tooltip>
      );
    }

    return <FormRow>{formGroup}</FormRow>;
  }
  handleSwitchToText = () => {
    this.setState({ valueType: "text" });
  };
  handleSwitchToFile = () => {
    this.setState({ valueType: "file" });
  };

  getTypeRow() {
    const isTextSecret = this.isTextSecret();

    return (
      <FormRow>
        <FormGroup className="column-12">
          <FieldLabel>
            <Trans render="span">Type</Trans>
          </FieldLabel>
          <FieldLabel>
            <FieldInput
              checked={isTextSecret}
              onChange={this.handleSwitchToText}
              name="type"
              type="radio"
              value="text"
            />
            <div className="flex flex-align-items-center">
              <Trans>Key-Value Pair</Trans>
            </div>
          </FieldLabel>
          <FieldLabel>
            <FieldInput
              checked={!isTextSecret}
              onChange={this.handleSwitchToFile}
              name="type"
              type="radio"
              value="file"
            />
            <Trans>File</Trans>
          </FieldLabel>
        </FormGroup>
      </FormRow>
    );
  }

  getValueRow() {
    const { textValue: fieldValue, localErrors } = this.state;
    const hasError = Boolean(localErrors && localErrors.textValue);

    return (
      <FormRow>
        <FormGroup className="column-12 flush-bottom" showError={hasError}>
          <FieldLabel>
            <FormGroupHeading required={true}>
              <Trans render={<FormGroupHeadingContent />}>Value</Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldTextarea name="textValue" value={fieldValue} />
          <FieldError>{hasError ? localErrors.textValue : null}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getFileRow() {
    const { fileValue: fieldValue } = this.state;
    const hasError = Boolean(
      this.state.localErrors && this.state.localErrors.file
    );

    return (
      <FormRow>
        <FormGroup className="column-12 flush-bottom" showError={hasError}>
          <FieldLabel>
            <FormGroupHeading required={true}>
              <Trans render={<FormGroupHeadingContent />}>File</Trans>
            </FormGroupHeading>
          </FieldLabel>

          {fieldValue ? (
            <FileOverview onDelete={this.handleFileClear} file={fieldValue} />
          ) : (
            <FieldFile name="file" onChange={this.handleFileChange} />
          )}

          <FormRow>
            <FieldError className="column-12">
              {hasError ? this.state.localErrors.file : null}
            </FieldError>
          </FormRow>
        </FormGroup>
      </FormRow>
    );
  }

  getReadOnlyFileRow() {
    return (
      <FormRow>
        <FormGroup className="column-12 flush-bottom">
          <FieldLabel>
            <FormGroupHeading required={true}>
              <Trans render={<FormGroupHeadingContent />}>File</Trans>
            </FormGroupHeading>
          </FieldLabel>
          <FieldTextarea
            disabled={true}
            name="textValue"
            value="File Uploaded"
          />
        </FormGroup>
      </FormRow>
    );
  }
  handleAffirmClick = () => {
    const localErrors = this.validateFields();
    this.setState({
      localErrors,
      pendingRequest: Object.keys(localErrors).length < 1,
    });

    if (Object.keys(localErrors).length) {
      return;
    }

    const { path, textValue, fileValue } = this.state;

    let value;
    if (this.isTextSecret()) {
      // Remove leading/trailing white space characters
      // and line terminators
      value = textValue.trim();
    } else {
      value = fileValue;
    }

    if (this.isEditingSecret()) {
      const { secret: previousSecret } = this.props;
      SecretStore.updateSecret(
        PrivatePluginsConfig.secretsDefaultStore,
        previousSecret.getPath(),
        value
      );

      return;
    }

    SecretStore.createSecret(
      PrivatePluginsConfig.secretsDefaultStore,
      path,
      value
    );
  };

  isTextSecret() {
    const { valueType } = this.state;

    return valueType === "text";
  }
  handleFormChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };
  handleFileChange = (event) => {
    this.setState({ fileValue: event.target.files[0] }, () => {
      const fileErrors = this.getFileFieldErrors();

      this.setState(({ localErrors }) => ({
        localErrors: { ...localErrors, ...fileErrors },
      }));
    });
  };
  handleFileClear = () => {
    this.setState({ fileValue: null, localErrors: null });
  };

  isEditingSecret() {
    return this.props.secret.path != null;
  }

  isPathValid(path) {
    // starts or ends with a dash
    return path && /^(?!\/).*[^/]$/.test(path);
  }

  isValid(path) {
    // all other errors
    return path && /^(\/?[a-zA-Z0-9-_])+$/.test(path);
  }
  validateFields = () => {
    return {
      ...this.getPathFieldErrors(),
      ...(this.isTextSecret()
        ? this.getValueFieldErrors()
        : this.getFileFieldErrors()),
    };
  };

  // We can not edit file based secrets because browsers like edge dont allow Files to be constructed
  denyFileBasedSecret() {
    return (
      !this.isTextSecret() && !browserSupportsFileApi && this.isEditingSecret()
    );
  }

  render() {
    let valueField = null;
    if (this.isTextSecret()) {
      valueField = this.getValueRow();
    } else {
      valueField = this.denyFileBasedSecret()
        ? this.getReadOnlyFileRow()
        : this.getFileRow();
    }

    return (
      <Modal
        footer={this.getModalFooter()}
        header={this.getModalHeading()}
        modalClass="modal modal-small"
        onClose={this.props.onClose}
        open={this.props.open}
        showFooter={true}
        showHeader={true}
      >
        <div onChange={this.handleFormChange}>
          {this.getErrorMessage()}
          {this.getPathRow()}
          {this.getTypeRow()}
          {valueField}
        </div>
      </Modal>
    );
  }
}

export default withI18n()(SecretFormModal);
