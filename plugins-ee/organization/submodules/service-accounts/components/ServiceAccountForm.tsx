import * as React from "react";
import { Trans } from "@lingui/macro";

import { InfoBoxInline } from "@dcos/ui-kit";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FieldTextarea from "#SRC/js/components/form/FieldTextarea";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldError from "#SRC/js/components/form/FieldError";

import { supportsWebCryptography } from "#SRC/js/utils/crypto";

import {
  ServiceAccountFormData,
  Errors
} from "../../../utils/ServiceAccountFormUtil";

interface ServiceAccountFormProps {
  formData: ServiceAccountFormData;
  isEdit?: boolean;
  errors: Errors;
  onChange: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface ServiceAccountFormState {
  manuallyEnteredSecretId: boolean;
  generatedSecretId: string;
}

export default class ServiceAccountForm extends React.Component<
  ServiceAccountFormProps,
  ServiceAccountFormState
> {
  constructor(props: Readonly<ServiceAccountFormProps>) {
    super(props);

    this.state = {
      manuallyEnteredSecretId: false,
      generatedSecretId: ""
    };
  }

  public handleFormChange = (e: React.FormEvent<HTMLFormElement>): void => {
    this.props.onChange(e);
  };

  public getInputErrors(
    fieldName: string,
    errors: Errors
  ): React.ReactNode | null {
    return errors ? errors[fieldName] : null;
  }

  public getKeyOptions() {
    const { isEdit, formData, errors } = this.props;

    if (isEdit) {
      return null;
    }

    const publicKeyError = this.getInputErrors("public_key", errors);
    const secretPathError = this.getInputErrors("secret_path", errors);

    return (
      <div>
        {supportsWebCryptography() && (
          <FormGroup>
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent>
                  <Trans>Key Pair / Public Key</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={formData.key_method === "auto-generate"}
                name="key_method"
                type="radio"
                value="auto-generate"
              />
              <Trans>Auto-Generate Key Pair &amp; Service Account Secret</Trans>
            </FieldLabel>
            <FieldLabel>
              <FieldInput
                checked={formData.key_method === "manual"}
                name="key_method"
                type="radio"
                value="manual"
              />
              <Trans>Manually Enter Public Key</Trans>
            </FieldLabel>
          </FormGroup>
        )}

        {formData.key_method === "auto-generate" && (
          <div>
            <FormGroup showError={Boolean(secretPathError)}>
              <FieldLabel>
                <FormGroupHeading required={true}>
                  <FormGroupHeadingContent>
                    <Trans>Secret ID</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                id="secret_path"
                name="secret_path"
                type="text"
                value={formData.secret_path}
                required={true}
              />
              <FieldError>{secretPathError}</FieldError>
            </FormGroup>
            <Trans render="p">Creating a service account will:</Trans>
            <ul>
              <Trans render="li">
                Generate a 2048 bit public and private key pair
              </Trans>
              <Trans render="li">
                The public key will be saved in the associated service account
              </Trans>
              <Trans render="li">
                The private key will be saved as a secret in the DC/OS Secret
                Store
              </Trans>
            </ul>
          </div>
        )}

        {formData.key_method === "manual" && (
          <FormGroup showError={Boolean(publicKeyError)}>
            <FieldLabel>
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent>
                  <Trans>Public Key</Trans>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldTextarea
              id="public_key"
              name="public_key"
              required={true}
              value={formData.public_key}
              spellCheck="false"
              rows={5}
            />
            <FieldError>{publicKeyError}</FieldError>
          </FormGroup>
        )}
      </div>
    );
  }

  public render() {
    const { formData, isEdit, errors } = this.props;

    const unanchoredError = this.getInputErrors("unanchored", errors);
    const descriptionError = this.getInputErrors("description", errors);
    const uidError = this.getInputErrors("uid", errors);

    return (
      <form onChange={this.handleFormChange} noValidate={true}>
        {Boolean(unanchoredError) && (
          <FormGroup>
            <InfoBoxInline
              className="error-unanchored"
              appearance="danger"
              message={<React.Fragment>{unanchoredError}</React.Fragment>}
            />
          </FormGroup>
        )}
        {!isEdit && (
          <div>
            <FormGroup showError={Boolean(uidError)}>
              <FieldLabel>
                <FormGroupHeading required={true}>
                  <FormGroupHeadingContent>
                    <Trans>ID</Trans>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                id="uid"
                name="uid"
                required={true}
                type="text"
                value={formData.uid}
                autoComplete="off"
                autoFocus={true}
              />
              <FieldError>{uidError}</FieldError>
            </FormGroup>
          </div>
        )}
        <FormGroup showError={Boolean(descriptionError)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent>
                <Trans>Description</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            id="description"
            name="description"
            required={false}
            type="text"
            value={formData.description}
            autoFocus={isEdit}
          />
          <FieldError>{descriptionError}</FieldError>
        </FormGroup>
        {this.getKeyOptions()}
      </form>
    );
  }
}
