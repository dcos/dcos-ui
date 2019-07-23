import * as React from "react";
import { routerShape } from "react-router";
import { Trans } from "@lingui/macro";
import gql from "graphql-tag";
import { DataLayer, DataLayerType } from "@extension-kid/data-layer";
import { take } from "rxjs/operators";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import container from "#SRC/js/container";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FullScreenModal from "#SRC/js/components/modals/FullScreenModal";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";
import FullScreenModalHeaderTitle from "#SRC/js/components/modals/FullScreenModalHeaderTitle";
import FieldError from "#SRC/js/components/form/FieldError";

//@ts-ignore
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

const dl = container.get<DataLayer>(DataLayerType);

const groupCreateMutation = gql`
  mutation {
    createGroup(data: $data)
  }
`;

interface GroupFormData {
  id?: string;
  name: string;
  enforceRole: boolean;
  quota: {
    cpus: string;
    mem: string;
    disk: string;
    gpus: string;
  };
  [key: string]: unknown;
}

interface GroupFormErrors {
  name?: React.ReactNode | React.ReactNode[];
  misc?: React.ReactNode | React.ReactNode[];
}

interface ServiceRootGroupModalState {
  isOpen: boolean;
  isPending: boolean;
  data: GroupFormData;
  errors: GroupFormErrors;
}

interface ServiceRootGroupModalProps {
  isEdit: boolean;
}

const METHODS_TO_BIND: string[] = [
  "handleClose",
  "handleFormChange",
  "handleSave",
  "getHeader",
  "getMiscErrors",
  "getModalContent",
  "getSaveAction",
  "validateFormData"
];

function newData(): GroupFormData {
  return {
    name: "",
    quota: {
      cpus: "",
      mem: "",
      disk: "",
      gpus: ""
    },
    enforceRole: true
  };
}

function updateData(
  fieldName: string,
  value: unknown,
  data: GroupFormData
): GroupFormData {
  const fieldPath = fieldName.split(".");
  if (fieldPath.length > 1) {
    throw new Error("Not Implemented");
  } else {
    data[fieldPath[0]] = value;
  }
  return data;
}

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

    this.state = this.getState();

    METHODS_TO_BIND.forEach(method => {
      // @ts-ignore
      this[method] = this[method].bind(this);
    });
  }

  getState(
    _props: ServiceRootGroupModalProps = this.props
  ): ServiceRootGroupModalState {
    return {
      isOpen: true,
      isPending: false,
      data: newData(),
      errors: {}
    };
  }

  handleClose() {
    // Start the animation of the modal by setting isOpen to false
    this.setState({ isOpen: false, isPending: false, data: newData() }, () => {
      // Once state is set, start a timer for the length of the animation and
      // navigate away once the animation is over.
      setTimeout(this.context.router.goBack, 300);
    });
  }

  handleSave() {
    const errors = this.validateFormData();
    if (errors) {
      this.setState({ errors });
      return;
    }
    this.setState({ isPending: true });
    this.getSaveAction()
      .pipe(take(1))
      .subscribe({
        next: () => this.handleClose(),
        error: e => {
          switch (e.message) {
            case "Conflict":
              this.setState({
                errors: {
                  name: (
                    <Trans>
                      A group with the same name already exists. Try a different
                      name.
                    </Trans>
                  )
                },
                isPending: false
              });
              return;
            case "Forbidden":
              this.setState({
                errors: {
                  misc: (
                    <Trans>You do not have permission to create a group.</Trans>
                  )
                },
                isPending: false
              });
              return;
            default:
              this.setState({
                errors: {
                  misc: <span>Unable to create group: {e.message}</span>
                },
                isPending: false
              });
              return;
          }
        }
      });
  }

  getSaveAction() {
    const createContext = {
      data: this.state.data
    };

    return dl.query(groupCreateMutation, createContext);
  }

  getHeader() {
    return (
      <FullScreenModalHeader>
        <FullScreenModalHeaderActions
          actions={[
            {
              className: "button-primary-link button-flush-horizontal",
              clickHandler: this.handleClose,
              label: "Cancel"
            }
          ]}
          type="secondary"
        />
        <FullScreenModalHeaderTitle>
          <Trans>New Group</Trans>
        </FullScreenModalHeaderTitle>
        <FullScreenModalHeaderActions
          actions={[
            {
              className: "button-primary flush-vertical",
              clickHandler: this.handleSave,
              label: "Save"
            }
          ]}
          type="primary"
        />
      </FullScreenModalHeader>
    );
  }

  getModalContent() {
    const { data, isPending, errors } = this.state;
    return (
      <form className="container" onChange={this.handleFormChange}>
        {this.getMiscErrors()}
        <Trans render="h1" className="flush-top short-bottom">
          General
        </Trans>
        <FormRow>
          <FormGroup
            className="column-12 column-medium-4"
            showError={Boolean(errors.name)}
          >
            <FieldLabel>
              <FormGroupHeading required={true}>
                <Trans render={<FormGroupHeadingContent primary={true} />}>
                  Name
                </Trans>
              </FormGroupHeading>
            </FieldLabel>
            <FieldAutofocus>
              <FieldInput
                name="name"
                type="text"
                value={data.name}
                disabled={this.props.isEdit || isPending}
              />
            </FieldAutofocus>
            <FieldError>{errors.name}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup className="column-12">
            <FieldLabel>
              <FormGroupHeading>
                <Trans render={<FormGroupHeadingContent primary={false} />}>
                  Path
                </Trans>
              </FormGroupHeading>
            </FieldLabel>
            <div>{`/${data.name}`}</div>
          </FormGroup>
        </FormRow>
      </form>
    );
  }

  getMiscErrors() {
    const { errors } = this.state;
    if (!Boolean(errors.misc)) {
      return null;
    }
    const { misc } = errors;
    const errorMessages = Array.isArray(misc) ? misc : [misc];
    const errorItems = errorMessages.map((message, index) => {
      return (
        <li key={index} className="errorsAlert-listItem">
          {message}
        </li>
      );
    });
    return (
      <div className="infoBoxWrapper">
        <InfoBoxInline
          appearance="danger"
          message={
            <div className="flex">
              <div>
                <Icon
                  shape={SystemIcons.Yield}
                  size={iconSizeXs}
                  color="currentColor"
                />
              </div>
              <div className="errorsAlert-message">
                <ul className="errorsAlert-list">{errorItems}</ul>
              </div>
            </div>
          }
        />
      </div>
    );
  }

  handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLFormElement;
    const fieldName = target.getAttribute("name");
    if (!fieldName) {
      return;
    }
    const { data } = this.state;
    this.setState({ data: updateData(fieldName, target.value, data) });
  }

  validateFormData(): void | GroupFormErrors {
    let errors: GroupFormErrors = {};
    const { data } = this.state;
    // Validate Name
    if (!ServiceValidatorUtil.isValidGroupID(data.name)) {
      errors.name = (
        <Trans>
          Group name must be at least 1 character and may only contain digits
          (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may
          not begin or end with a dash or dot.
        </Trans>
      );
    }

    if (Object.keys(errors).length > 0) {
      return errors;
    }
    return;
  }

  render() {
    return (
      <FullScreenModal
        header={this.getHeader()}
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
