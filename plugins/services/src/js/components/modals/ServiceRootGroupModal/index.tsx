import * as React from "react";
import { routerShape } from "react-router";
import { I18n } from "@lingui/core";
import { Trans } from "@lingui/macro";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import { take } from "rxjs/operators";
import { Badge, SpacingBox } from "@dcos/ui-kit";
import set from "lodash.set";
import { Tooltip } from "reactjs-components";

import container from "#SRC/js/container";
import { TYPES } from "#SRC/js/types/containerTypes";
//@ts-ignore
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
//@ts-ignore
import AdvancedSectionContent from "#SRC/js/components/form/AdvancedSectionContent";
//@ts-ignore
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FieldError from "#SRC/js/components/form/FieldError";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";

import {
  GroupFormData,
  GroupFormErrors
} from "#PLUGINS/services/src/js/types/GroupForm";

import GroupModalHeader from "./Header";
import ErrorsPanel from "./ErrorsPanel";
import {
  emptyGroupFormData,
  getPathFromGroupId,
  validateGroupFormData
} from "./utils";

const dl = container.get<DataLayer>(DataLayerType);
const i18n = container.get<I18n>(TYPES.I18n);

const groupCreateMutation = gql`
  mutation {
    createGroup(data: $data)
  }
`;

function getSaveAction(data: GroupFormData) {
  return dl.query(groupCreateMutation, {
    data
  });
}

interface ServiceRootGroupModalState {
  isOpen: boolean;
  isPending: boolean;
  expandAdvancedSettings: boolean;
  data: GroupFormData;
  errors: GroupFormErrors;
}

interface ServiceRootGroupModalProps {
  isEdit: boolean;
}

const METHODS_TO_BIND: string[] = [
  "getAdvancedSettings",
  "getModalContent",
  "handleAdvancedSectionClick",
  "handleClose",
  "handleFormChange",
  "handleSave"
];

class ServiceRootGroupModal extends React.Component<
  ServiceRootGroupModalProps,
  ServiceRootGroupModalState
> {
  static contextTypes = {
    router: routerShape
  };
  static defaultProps = {
    isEdit: false
  };

  constructor() {
    // @ts-ignore
    super(...arguments);

    this.state = this.getInitialState();

    METHODS_TO_BIND.forEach(method => {
      // @ts-ignore
      this[method] = this[method].bind(this);
    });
  }

  getInitialState(
    _props: ServiceRootGroupModalProps = this.props
  ): ServiceRootGroupModalState {
    return {
      isOpen: true,
      isPending: false,
      expandAdvancedSettings: false,
      data: emptyGroupFormData(),
      errors: {}
    };
  }

  handleClose() {
    // Start the animation of the modal by setting isOpen to false
    this.setState(
      { isOpen: false, isPending: false, data: emptyGroupFormData() },
      () => {
        // Once state is set, start a timer for the length of the animation and
        // navigate away once the animation is over.
        setTimeout(this.context.router.goBack, 300);
      }
    );
  }

  handleSave() {
    if (this.state.isPending) {
      return;
    }
    const errors = validateGroupFormData(this.state.data, this.props.isEdit);
    if (errors) {
      this.setState({ errors });
      return;
    }
    this.setState({ isPending: true });
    getSaveAction(this.state.data)
      .pipe(take(1))
      .subscribe({
        next: () => this.handleClose(),
        error: e => {
          //TODO: If error creating quota switch to Edit Mode for group, must
          // Be done after edit mode supported.
          switch (e.message) {
            case "Conflict - Group":
              this.setState({
                errors: {
                  id: <Trans>Name already exists. Try a different name.</Trans>,
                  form: [
                    <Trans key="groupIdConflict">
                      A group with the same name already exists. Try a different
                      name.
                    </Trans>
                  ]
                },
                isPending: false
              });
              return;
            case "Forbidden - Group":
              this.setState({
                errors: {
                  form: [
                    <Trans key="groupPermission">
                      You do not have permission to create a group.
                    </Trans>
                  ]
                },
                isPending: false
              });
              return;
            default:
              this.setState({
                errors: {
                  form: [
                    <Trans key="miscGroup">
                      Unable to create group: {e.message}
                    </Trans>
                  ]
                },
                isPending: false
              });
              return;
          }
        }
      });
  }

  handleAdvancedSectionClick() {
    this.setState({
      expandAdvancedSettings: !this.state.expandAdvancedSettings
    });
  }

  getModalContent() {
    const { data, errors } = this.state;
    return (
      <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
        <FluidGeminiScrollbar>
          <div className="modal-body-padding-surrogate create-service-modal-form-container">
            <form className="container" onChange={this.handleFormChange}>
              <ErrorsPanel errors={this.state.errors.form} />
              <Trans render="h1" className="flush-top short-bottom">
                General
              </Trans>
              <FormRow>
                <FormGroup
                  className="column-12 column-medium-4"
                  showError={Boolean(errors.id)}
                >
                  <FieldLabel>
                    <FormGroupHeading required={true}>
                      <Trans
                        render={<FormGroupHeadingContent primary={true} />}
                      >
                        Name
                      </Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <FieldAutofocus>
                    <FieldInput
                      name="id"
                      type="text"
                      value={data.id}
                      disabled={this.props.isEdit}
                    />
                  </FieldAutofocus>
                  <FieldError>{errors.id}</FieldError>
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup className="column-12">
                  <FieldLabel>
                    <FormGroupHeading>
                      <Trans
                        render={<FormGroupHeadingContent primary={false} />}
                      >
                        Path
                      </Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <div>{getPathFromGroupId(data.id)}</div>
                </FormGroup>
              </FormRow>
              <h2 className="short-bottom">
                <FormGroupHeading>
                  <Trans render={<FormGroupHeadingContent primary={true} />}>
                    Quota
                  </Trans>
                </FormGroupHeading>
              </h2>
              <Trans render="p">
                Define the maximum amount of resources that can be used by
                services in this group.
              </Trans>
              <FormRow>
                <FormGroup
                  className="column-2"
                  showError={errors.quota && Boolean(errors.quota.cpus)}
                >
                  <FieldLabel>
                    <FormGroupHeading>
                      <Trans render={<FormGroupHeadingContent />}>CPUs</Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <FieldAutofocus>
                    <FieldInput
                      name="quota.cpus"
                      type="text"
                      value={data.quota.cpus}
                    />
                    <FieldError>
                      {errors.quota && errors.quota.cpus
                        ? errors.quota.cpus
                        : null}
                    </FieldError>
                  </FieldAutofocus>
                </FormGroup>
                <FormGroup
                  className="column-2"
                  showError={errors.quota && Boolean(errors.quota.mem)}
                >
                  <FieldLabel>
                    <FormGroupHeading>
                      <Trans render={<FormGroupHeadingContent />}>
                        Mem (MiB)
                      </Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <FieldInput
                    name="quota.mem"
                    type="text"
                    value={data.quota.mem}
                  />
                  <FieldError>
                    {errors.quota && errors.quota.mem ? errors.quota.mem : null}
                  </FieldError>
                </FormGroup>
                <FormGroup
                  className="column-2"
                  showError={errors.quota && Boolean(errors.quota.disk)}
                >
                  <FieldLabel>
                    <FormGroupHeading>
                      <Trans render={<FormGroupHeadingContent />}>
                        Disk (MiB)
                      </Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <FieldInput
                    name="quota.disk"
                    type="text"
                    value={data.quota.disk}
                  />
                  <FieldError>
                    {errors.quota && errors.quota.disk
                      ? errors.quota.disk
                      : null}
                  </FieldError>
                </FormGroup>
                <FormGroup
                  className="column-2"
                  showError={errors.quota && Boolean(errors.quota.gpus)}
                >
                  <FieldLabel>
                    <FormGroupHeading>
                      <Trans render={<FormGroupHeadingContent />}>GPUs</Trans>
                    </FormGroupHeading>
                  </FieldLabel>
                  <FieldInput
                    name="quota.gpus"
                    type="text"
                    value={data.quota.gpus}
                  />
                  <FieldError>
                    {errors.quota && errors.quota.gpus
                      ? errors.quota.gpus
                      : null}
                  </FieldError>
                </FormGroup>
              </FormRow>
              {this.getAdvancedSettings()}
            </form>
          </div>
        </FluidGeminiScrollbar>
      </div>
    );
  }

  getAdvancedSettings() {
    const { data } = this.state;
    const roleEnforcementTooltipContent = (
      <Trans>
        Select role type that will be enforced to all services added inside this
        group
      </Trans>
    );

    return (
      <AdvancedSection shouldExpand={this.state.expandAdvancedSettings}>
        <AdvancedSectionLabel onClick={this.handleAdvancedSectionClick}>
          <Trans>Advanced Settings</Trans>
        </AdvancedSectionLabel>
        <AdvancedSectionContent>
          <FormRow>
            <FormGroup className="column-12">
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent>
                    <Trans>Role Enforcement</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={roleEnforcementTooltipContent}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldLabel className="text-align-left">
                <FieldInput
                  checked={data.enforceRole}
                  type="radio"
                  name="enforceRole"
                  value={true}
                />
                <Trans>Use group role</Trans>
                <SpacingBox side="left" spacingSize="s" tag="span">
                  <Badge>
                    <Trans>Recommended</Trans>
                  </Badge>
                </SpacingBox>
              </FieldLabel>
              <FieldLabel className="text-align-left">
                <FieldInput
                  checked={!data.enforceRole}
                  type="radio"
                  name="enforceRole"
                  value={false}
                />
                <Trans>Use legacy role</Trans>
              </FieldLabel>
            </FormGroup>
          </FormRow>
        </AdvancedSectionContent>
      </AdvancedSection>
    );
  }

  handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    if (this.state.isPending) {
      return;
    }
    const target = event.target as HTMLInputElement;
    const fieldName = target.getAttribute("name");
    if (!fieldName) {
      return;
    }
    let value: string | boolean;
    switch (target.type) {
      case "checkbox":
        value = target.checked;
        break;
      case "radio":
        value = target.value;
        if (value === "true" || value === "false") {
          value = value === "true";
        }
        break;
      default:
        value = target.value;
        break;
    }

    const { data } = this.state;
    this.setState({ data: set(data, fieldName, value) });
  }

  render() {
    return (
      <FullScreenModal
        header={
          <GroupModalHeader
            i18n={i18n}
            isEdit={this.props.isEdit}
            onClose={this.handleClose}
            onSave={this.handleSave}
          />
        }
        useGemini={false}
        open={this.state.isOpen}
        {...this.props}
      >
        {this.getModalContent()}
      </FullScreenModal>
    );
  }
}

export default ServiceRootGroupModal;
