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
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FieldError from "#SRC/js/components/form/FieldError";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import Loader from "#SRC/js/components/Loader";

// @ts-ignore
import MesosStateStore from "#SRC/js/stores/MesosStateStore";

import { formatQuotaID } from "#PLUGINS/services/src/js/utils/QuotaUtil";
import {
  GroupFormData,
  GroupFormErrors,
  GroupMutationResponse
} from "#PLUGINS/services/src/js/types/GroupForm";

import GroupModalHeader from "./Header";
import ErrorsPanel from "./ErrorsPanel";
import {
  emptyGroupFormData,
  errorsFromOvercommitData,
  groupFormDataFromGraphql,
  getPathFromGroupId,
  validateGroupFormData
} from "./utils";
import { Observable } from "rxjs";
import { OvercommittedQuotaResource } from "#PLUGINS/services/src/js/data/errors/OvercommitQuotaError";

const dl = container.get<DataLayer>(DataLayerType);
const i18n = container.get<I18n>(TYPES.I18n);

const groupCreateMutation = gql`
  mutation {
    createGroup(data: $data)
  }
`;

const groupEditMutation = gql`
  mutation {
    editGroup(data: $data)
  }
`;

function getSaveAction(
  data: GroupFormData,
  isEdit: boolean
): Observable<{
  data: {
    createGroup?: GroupMutationResponse;
    editGroup: GroupMutationResponse;
  };
}> {
  if (!isEdit) {
    return dl.query(groupCreateMutation, {
      data
    });
  }
  return dl.query(groupEditMutation, {
    data
  });
}

function getGroup(id: string) {
  return dl.query(
    gql`
      query {
        group(id: $id) {
          id
          name
          quota
        }
      }
    `,
    { id, mesosStateStore: MesosStateStore }
  );
}

interface ServiceRootGroupModalState {
  isOpen: boolean;
  isPending: boolean;
  expandAdvancedSettings: boolean;
  data: GroupFormData | null;
  originalData: GroupFormData | null;
  errors: GroupFormErrors;
  isEdit: boolean;
  error: boolean;
  isForce: boolean;
  hasValidated: boolean;
}

interface ServiceRootGroupModalProps {
  id: string;
}

const METHODS_TO_BIND: string[] = [
  "getAdvancedSettings",
  "getModalContent",
  "handleClose",
  "handleFormChange",
  "handleSave",
  "handleSaveError",
  "getGroupFormData"
];

class ServiceRootGroupModal extends React.Component<
  ServiceRootGroupModalProps,
  ServiceRootGroupModalState
> {
  static contextTypes = {
    router: routerShape
  };
  static defaultProps = {
    id: ""
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

  componentDidMount() {
    this.getGroupFormData();
  }

  getInitialState(
    props: ServiceRootGroupModalProps = this.props
  ): ServiceRootGroupModalState {
    return {
      isOpen: true,
      isPending: false,
      expandAdvancedSettings: false,
      data: !!props.id ? null : emptyGroupFormData(),
      originalData: null,
      errors: {},
      isEdit: !!props.id,
      error: false,
      isForce: false,
      hasValidated: false
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
    let data: GroupFormData | null = this.state.data;
    const { isPending, originalData, isEdit, isForce } = this.state;
    if (isPending || data === null) {
      return;
    }

    if (originalData && JSON.stringify(data) === JSON.stringify(originalData)) {
      // No changes.
      return this.handleClose();
    }
    const errors = validateGroupFormData(data, isEdit);
    if (errors) {
      this.setState({ errors, hasValidated: true });
      return;
    }

    this.setState({ isPending: true, hasValidated: true });
    if (!isEdit) {
      //Format id
      const newID = formatQuotaID(data.id);
      data = (({ id, ...other }: GroupFormData): GroupFormData => ({
        id: newID,
        ...other
      }))(data);
    }
    if (isForce) {
      data.quota.force = true;
    }
    getSaveAction(data, isEdit)
      .pipe(take(1))
      .subscribe({
        next: mutationResponse => {
          let resp: GroupMutationResponse;
          if (mutationResponse.data.createGroup) {
            resp = mutationResponse.data.createGroup;
          } else if (mutationResponse.data.editGroup) {
            resp = mutationResponse.data.editGroup;
          } else {
            resp = {
              code: 0,
              success: false,
              partialSuccess: false,
              message: "Unknown response"
            };
          }
          if (resp.success) {
            return this.handleClose();
          }
          if (resp.partialSuccess) {
            if (!isEdit) {
              // switch to  edit mode
              const { id, enforceRole } = data as GroupFormData;
              this.setState({
                isEdit: true,
                data,
                originalData: {
                  ...emptyGroupFormData(),
                  id,
                  enforceRole
                }
              });
            }
            this.handleSaveError(resp.message, true, resp.data || null);
          } else {
            this.handleSaveError(resp.message);
          }
        },
        error: e => {
          // Be done after edit mode supported.
          this.handleSaveError(e.message);
        }
      });
  }

  handleSaveError(
    message: string,
    mesos: boolean = false,
    data: null | OvercommittedQuotaResource[] = null
  ) {
    switch (message) {
      case "Conflict":
        this.setState({
          errors: {
            id: <Trans>Name already exists. Try a different name.</Trans>,
            form: [
              <Trans key="groupIdConflict">
                A group with the same name already exists. Try a different name.
              </Trans>
            ]
          },
          isPending: false
        });
        return;
      case "Forbidden":
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
      case "Overcommit":
        this.setState({
          errors: errorsFromOvercommitData(data),
          isPending: false,
          isForce: true
        });
        return;
      default:
        const { isEdit } = this.state;
        const form = [];
        if (mesos) {
          if (isEdit) {
            form.push(
              <Trans key="quotaError">
                Unable to update group's quota: {message}
              </Trans>
            );
          } else {
            form.push(
              <Trans key="quotaError">
                Unable to create group's quota: {message}
              </Trans>
            );
          }
        } else if (isEdit) {
          form.push(
            <Trans key="miscGroup">Unable to update group: {message}</Trans>
          );
        } else {
          form.push(
            <Trans key="miscGroup">Unable to create group: {message}</Trans>
          );
        }
        this.setState({
          errors: {
            form
          },
          isPending: false
        });
        return;
    }
  }

  getGroupFormData(): void {
    const { id } = this.props;
    if (!!id) {
      getGroup(id)
        .pipe(take(1))
        .subscribe({
          next: groupData => {
            const data = groupFormDataFromGraphql(groupData.data.group);
            this.setState({
              data,
              originalData: JSON.parse(JSON.stringify(data)),
              expandAdvancedSettings: !data.enforceRole
            });
          },
          error: () => {
            this.setState({ error: true });
          }
        });
    }
  }

  getModalContent() {
    const { errors, data, isEdit, error } = this.state;
    // If id exists, then we must be editing.

    if (error) {
      return <Trans>Looks Like Something is Wrong. Please try again.</Trans>;
    }

    if (!data) {
      return <Loader />;
    }

    return (
      <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
        <FluidGeminiScrollbar>
          <div className="modal-body-padding-surrogate create-service-modal-form-container">
            <form className="container" onChange={this.handleFormChange}>
              <ErrorsPanel errors={errors.form} />
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
                      disabled={isEdit}
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
    const { data, originalData, expandAdvancedSettings, isEdit } = this.state;
    const roleEnforcementTooltipContent = (
      <Trans>
        Select role type that will be enforced to all services added inside this
        group
      </Trans>
    );

    if (!data) {
      return;
    }

    const isDisabled = isEdit && originalData && originalData.enforceRole;

    return (
      <AdvancedSection initialIsExpanded={expandAdvancedSettings}>
        <AdvancedSectionLabel>
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
                  disabled={isDisabled}
                />
                <Trans>Use Group Role</Trans>
                <SpacingBox side="left" spacingSize="s" tag="span">
                  <Badge>
                    <Trans>Recommended</Trans>
                  </Badge>
                </SpacingBox>
                <FieldHelp>
                  <Trans>
                    Allows Quota to be enforced on all the services in the
                    group.
                  </Trans>
                </FieldHelp>
              </FieldLabel>
              <FieldLabel className="text-align-left">
                <FieldInput
                  checked={!data.enforceRole}
                  type="radio"
                  name="enforceRole"
                  value={false}
                  disabled={isDisabled}
                />
                <Trans>Use Legacy Role</Trans>
                <FieldHelp>
                  <Trans>
                    Will not enforce quota on all services in the group.
                  </Trans>
                </FieldHelp>
              </FieldLabel>
            </FormGroup>
          </FormRow>
        </AdvancedSectionContent>
      </AdvancedSection>
    );
  }

  handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    if (this.state.isPending || !this.state.data) {
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

    const { data, isEdit, hasValidated } = this.state;
    const newData = set(data, fieldName, value);
    if (hasValidated) {
      const newErrors = validateGroupFormData(newData, isEdit);
      this.setState({
        data: newData,
        errors: newErrors || {},
        isForce: false
      });
    } else {
      this.setState({ data: newData });
    }
  }

  render() {
    const { isEdit, isForce } = this.state;
    return (
      <FullScreenModal
        header={
          <GroupModalHeader
            i18n={i18n}
            mode={isForce ? "force" : isEdit ? "edit" : "create"}
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
