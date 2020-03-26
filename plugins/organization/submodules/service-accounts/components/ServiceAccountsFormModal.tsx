import * as React from "react";

import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import { RequestUtil } from "mesosphere-shared-reactjs";
import { Modal } from "reactjs-components";
import { Link } from "react-router";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import { generatePrintableRSAKeypair } from "#SRC/js/utils/crypto";

import * as EventTypes from "../constants/EventTypes";
import ServiceAccountForm from "./ServiceAccountForm";
import getACLServiceAccountsStore from "../stores/ACLServiceAccountsStore";
import {
  ServiceAccountFormData,
  Errors,
  getErrors,
  requiredFieldPresent,
  hasErrors,
  defaultFormData,
  validUid,
  validSecretPath,
} from "../../../utils/ServiceAccountFormUtil";

const ACLServiceAccountsStore = getACLServiceAccountsStore();
const {
  ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
  ACL_SERVICE_ACCOUNT_DELETE_ERROR,
  ACL_SERVICE_ACCOUNT_CREATE_ERROR,
  ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
  ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
} = EventTypes;

interface ServiceAccountFormModalProps {
  account?: ServiceAccountFormData;
  onClose: () => void;
  onSubmit?: (data: ServiceAccountFormData) => void;
  open: boolean;
  i18n: any;
}

interface ServiceAccountFormModalState {
  // Disabled while request active
  pendingRequest: boolean;

  // Indicates service account creation succeeded but secret creation failed and then service account deletion failed
  failedToComplete: boolean;

  // Once the user has typed into the secret id, use that value. Otherwise, it will be automatically derived from the account id
  manuallyEnteredSecretId: boolean;
  formData: ServiceAccountFormData;
  errors: Errors;
}

class ServiceAccountFormModal extends React.Component<
  ServiceAccountFormModalProps,
  ServiceAccountFormModalState
> {
  constructor(props: Readonly<ServiceAccountFormModalProps>) {
    super(props);

    this.state = {
      pendingRequest: false,
      failedToComplete: false,
      formData: this.getFormDataFromAccount(props.account) || defaultFormData(),
      manuallyEnteredSecretId: false,
      errors: {},
    };
  }

  public componentDidMount() {
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
      this.onAclStoreCreateSuccess
    );
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_DELETE_ERROR,
      this.onAclStoreDeleteError
    );
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_CREATE_ERROR,
      this.onAclStoreCreateError
    );
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
      this.onAclStoreUpdateError
    );
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
      this.onAclStoreUpdateSuccess
    );
  }

  public componentWillUnmount() {
    ACLServiceAccountsStore.removeChangeListener(
      ACL_SERVICE_ACCOUNT_CREATE_SUCCESS,
      this.onAclStoreCreateSuccess
    );
    ACLServiceAccountsStore.addChangeListener(
      ACL_SERVICE_ACCOUNT_DELETE_ERROR,
      this.onAclStoreDeleteError
    );
    ACLServiceAccountsStore.removeChangeListener(
      ACL_SERVICE_ACCOUNT_CREATE_ERROR,
      this.onAclStoreCreateError
    );
    ACLServiceAccountsStore.removeChangeListener(
      ACL_SERVICE_ACCOUNT_UPDATE_ERROR,
      this.onAclStoreUpdateError
    );
    ACLServiceAccountsStore.removeChangeListener(
      ACL_SERVICE_ACCOUNT_UPDATE_SUCCESS,
      this.onAclStoreUpdateSuccess
    );
  }

  public prefillSecretIdMaybe(
    data: ServiceAccountFormData
  ): ServiceAccountFormData {
    if (
      !this.props.account &&
      data.uid &&
      !this.state.manuallyEnteredSecretId
    ) {
      data.secret_path = `${data.uid.trim()}-secret`;
    }

    return data;
  }

  public getFormDataFromAccount(account: any): ServiceAccountFormData | null {
    if (account != null) {
      return {
        description: account.description,
      };
    }
    return null;
  }

  // If the service account was created, but the create secret has failed, the
  // action will delete the created account. If the delete fails, the modal will
  // be in a deadend, failed state (failedToComplete)
  public createOrRollback(): void {
    const { formData } = this.state;

    if (formData.key_method === "auto-generate") {
      generatePrintableRSAKeypair().then(([privateKey, publicKey]) => {
        formData.public_key = publicKey;
        formData.private_key = privateKey;

        ACLServiceAccountsStore.add(formData);
      });

      return;
    }

    ACLServiceAccountsStore.add(formData);
  }

  public onAclStoreCreateSuccess = (): void => {
    this.setState({
      pendingRequest: false,
      errors: {},
      formData: defaultFormData(),
      failedToComplete: false,
      manuallyEnteredSecretId: false,
    });
    this.props.onClose();
  };

  public onAclStoreDeleteError = (): void => {
    const prevFormData = this.state.formData;

    this.setState({
      pendingRequest: false,
      formData: defaultFormData(),
      errors: {
        unanchored: (
          <div>
            <Trans render="p">
              The service account{" "}
              <Link to={`/organization/service-accounts/${prevFormData.uid}`}>
                {prevFormData.uid}
              </Link>{" "}
              was created but we were not able to also save the private key as a
              secret.
            </Trans>
            <Trans render="p">
              Please delete this service account and try again or use the CLI.
            </Trans>
          </div>
        ),
      },
    });
  };

  public onAclStoreCreateError = (
    errorMsg: string,
    _: any,
    xhr: XMLHttpRequest
  ): void => {
    const response = RequestUtil.parseResponseBody(xhr);
    let errors = getErrors(response.code, errorMsg);
    if (Object.keys(errors).length === 0) {
      errors =
        errorMsg.toLowerCase().indexOf("secret") >= 0
          ? { secret_path: errorMsg }
          : { unanchored: errorMsg };
    }

    this.setState({
      pendingRequest: false,
      errors,
    });
  };

  public onAclStoreUpdateSuccess = (): void => {
    this.setState({
      pendingRequest: false,
      errors: {},
    });
    this.props.onClose();
  };

  public onAclStoreUpdateError = (errorMsg: string): void => {
    this.setState({
      pendingRequest: false,
      errors: {
        description: errorMsg,
      },
    });
  };

  public handleServiceAccountClose = (): void => {
    const { account, onClose } = this.props;
    this.setState({
      errors: {},
      failedToComplete: false,
      pendingRequest: false,
      manuallyEnteredSecretId: false,
      formData: this.getFormDataFromAccount(account) || defaultFormData(),
    });
    onClose();
  };

  public handleSubmit = (): void => {
    const { formData, failedToComplete, pendingRequest } = this.state;

    if (pendingRequest) {
      return;
    }

    if (failedToComplete) {
      this.handleServiceAccountClose();
    }

    const validationErrors = this.validateFormData();
    if (hasErrors(validationErrors)) {
      this.setState({
        errors: validationErrors,
      });
      return;
    }

    this.setState({ pendingRequest: true });

    if (this.props.account == null) {
      this.createOrRollback();
    } else if (this.props.onSubmit) {
      this.props.onSubmit(formData);
    }
  };

  public getHeader() {
    const { account } = this.props;
    const title =
      account != null ? (
        <Trans>Edit Service Account</Trans>
      ) : (
        <Trans>Create Service Account</Trans>
      );

    return <ModalHeading>{title}</ModalHeading>;
  }

  public handleFormChange = (e: React.FormEvent<HTMLFormElement>): void => {
    const { name, value } = e.target as HTMLInputElement;
    const { formData } = this.state;
    const newFormData = {
      ...formData,
      [name]: value,
    };

    if (name === "secret_path") {
      this.setState({
        manuallyEnteredSecretId: true,
        formData: newFormData,
      });
    } else {
      this.setState({
        formData: this.prefillSecretIdMaybe(newFormData),
      });
    }
  };

  public getModalContent(): React.ReactNode {
    const { formData, errors } = this.state;
    const { account } = this.props;

    return (
      <ServiceAccountForm
        formData={formData}
        onChange={this.handleFormChange}
        isEdit={account != null}
        errors={errors}
      />
    );
  }

  public getCtaText(): React.ReactNode {
    const { account } = this.props;
    const { failedToComplete, pendingRequest } = this.state;

    if (failedToComplete) {
      return <Trans>OK</Trans>;
    }

    if (account == null) {
      // Creating new account
      if (pendingRequest) {
        return <Trans>Creating...</Trans>;
      }
      return <Trans>Create Service Account</Trans>;
    }
    // Editing account
    if (pendingRequest) {
      return <Trans>Saving...</Trans>;
    }
    return <Trans>Save</Trans>;
  }

  public getFooter() {
    const { failedToComplete, pendingRequest } = this.state;
    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        {!failedToComplete && (
          <button
            className="button button-primary-link flush-left"
            onClick={this.handleServiceAccountClose}
          >
            <Trans>Cancel</Trans>
          </button>
        )}
        <button
          className="button button-primary"
          onClick={this.handleSubmit}
          disabled={pendingRequest}
        >
          {this.getCtaText()}
        </button>
      </div>
    );
  }

  public validateFormData(): Errors {
    const { formData } = this.state;
    const { account, i18n } = this.props;

    const missingMessage = i18n._(t`Field cannot be empty.`);
    const invalidMessage = i18n._(t`Invalid ID`);

    const errors: Errors = {};

    if (account == null) {
      if (!requiredFieldPresent("uid", formData)) {
        errors.uid = missingMessage;
      } else {
        if (!validUid(formData.uid)) {
          errors.uid = invalidMessage;
        }
      }

      if (formData.key_method === "auto-generate") {
        if (!requiredFieldPresent("secret_path", formData)) {
          errors.secret_path = missingMessage;
        } else {
          if (!validSecretPath(formData.secret_path)) {
            errors.secret_path = invalidMessage;
          }
        }
      } else {
        if (!requiredFieldPresent("public_key", formData)) {
          errors.public_key = missingMessage;
        }
      }
    }
    return errors;
  }

  public render() {
    const { open } = this.props;

    return (
      <Modal
        open={open}
        onClose={this.handleServiceAccountClose}
        footer={this.getFooter()}
        showFooter={true}
        modalClass="modal"
        header={this.getHeader()}
        showHeader={true}
      >
        {this.getModalContent()}
      </Modal>
    );
  }
}

export default withI18n()(ServiceAccountFormModal);
