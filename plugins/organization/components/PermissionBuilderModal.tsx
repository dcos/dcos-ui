import { i18nMark, withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import { Form, Modal, Tooltip } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon, InfoBoxInline } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import FilterBar from "#SRC/js/components/FilterBar";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import StringUtil from "#SRC/js/utils/StringUtil";
import ToggleButton from "#SRC/js/components/ToggleButton";

import ACLStore from "../submodules/acl/stores/ACLStore";

class PermissionBuilderModal extends mixin(StoreMixin) {
  static defaultProps = {
    activeView: "builder",
    disabled: false,
    dupesFound: [],
    errors: [],
    handleBulkAddToggle() {},
    open: false,
    onClose() {},
    onSubmit() {},
    permissionsAddedCount: 0,
  };
  static propTypes = {
    activeView: PropTypes.oneOf(["builder", "bulk"]),
    disabled: PropTypes.bool,
    dupesFound: PropTypes.array,
    errors: PropTypes.array,
    handleBulkAddToggle: PropTypes.func,
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    permissionsAddedCount: PropTypes.number,
    subject: PropTypes.object,
  };
  constructor(...args) {
    super(...args);

    this.state = {
      actions: "",
      chosenRIDs: [],
      errorMsg: null,
      model: {},
      resource: "",
    };

    this.store_listeners = [
      { name: "acl", events: ["fetchSchemaSuccess", "fetchSchemaError"] },
    ];
  }

  UNSAFE_componentWillMount() {
    ACLStore.fetchACLSchema();
  }

  onAclStoreFetchSchemaSuccess() {
    const chosenRIDs = this.preSelectPermissions(
      [],
      ACLStore.getPermissionSchema()
    );
    this.setState({ chosenRIDs, errorMsg: null });
  }

  onAclStoreFetchSchemaError() {
    const { i18n } = this.props;

    this.setState({ errorMsg: i18n._(t`Unable to fetch permission schema.`) });
  }
  handleSubmit = () => {
    this.props.onSubmit(this.getSubmittedACLs());
  };
  handleError = () => {
    // Make sure to update modal, as error fields might have made modal bigger
    this.forceUpdate();
  };
  handleClose = () => {
    this.props.onClose();
  };
  handleFormChange = (model, selection, item) => {
    const { index, permission } = item || {};
    let { chosenRIDs } = this.state;
    const newState = { model };

    if (permission && index != null) {
      chosenRIDs = chosenRIDs.slice(0, index);
      chosenRIDs.push(permission.rid);
      newState.chosenRIDs = this.preSelectPermissions(chosenRIDs, permission);
    }

    this.setState(newState);
  };
  handleBulkFormChange = (changeModel) => {
    this.setState(changeModel);
  };

  handleAllowAllActions(actions) {
    const { model } = this.state;
    model.actions = actions.map((name) => ({
      checked: true,
      label: StringUtil.capitalize(name),
      name,
    }));

    this.setState({ model });
  }

  isBulkAdd() {
    return this.props.activeView === "bulk";
  }

  preSelectPermissions(chosenRIDs, permission) {
    let nextChild = permission;
    while (nextChild.getItems() && nextChild.getItems().length === 1) {
      nextChild = nextChild.getItems()[0];
      chosenRIDs.push(nextChild.rid);
    }

    return chosenRIDs;
  }

  getDropdownItems(permission, index) {
    const { name, groupName } = permission;
    const defaultItem = [
      {
        className: "hidden",
        html: name,
        id: "default-item",
        permission,
        index,
        selectedHtml: "Select " + groupName,
      },
    ];

    return defaultItem.concat(
      permission.getItems().map((item) => {
        const itemName = item.name;

        return {
          className: "clickable",
          html: itemName,
          id: item.rid,
          permission: item,
          index,
          selectedHtml: itemName,
        };
      })
    );
  }

  getSelectedActions(actions = []) {
    return actions.reduce((actionNames, action) => {
      if (action.checked) {
        actionNames.push(action.name);
      }

      return actionNames;
    }, []);
  }

  getSubmittedACLs() {
    const { bulkacls = "", chosenRIDs, model } = this.state;

    if (this.isBulkAdd() && bulkacls !== null) {
      return bulkacls
        .split("\n")
        .filter((aclLine) => aclLine.length)
        .map((aclLine) => {
          const splitLine = aclLine.trim().split(" ");
          const resource = splitLine.shift().trim();
          const actions = splitLine
            .join(" ")
            .split(",")
            .map((action) => action.trim().toLowerCase());

          return {
            actions,
            resource,
          };
        });
    }
    return [
      {
        actions: this.getSelectedActions(model.actions),
        resource: this.getResourceString(model, chosenRIDs),
      },
    ];
  }

  getResourceString(model, chosenRIDs) {
    const resource = ACLStore.getPermissionSchema().collectPermissionString(
      chosenRIDs
    );

    // Create input value array sorted after index in the resource
    const values = Object.keys(model)
      // Filter out items that do not have a number as key
      .filter((item) => !isNaN(parseInt(item, 10)))
      // Remove 'input' from key, and parse integer to sort correctly
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((valueKey) => model[valueKey]);

    // Replace occurances of '*' with model values
    const segments = resource.split("*");

    return segments.reduce((memo, segment, index) => {
      // Do not add value to last segment
      if (segments.length - 1 === index) {
        return memo + segment;
      }

      // Add segment and model value
      return memo + segment + (values.shift() || "*");
    }, "");
  }

  getActionCheckboxDefinitions() {
    const { disabled, i18n } = this.props;
    const { chosenRIDs, model } = this.state;
    const actions = ACLStore.getPermissionSchema().collectActions(chosenRIDs);
    if (!actions.length) {
      return null;
    }

    const modelActions = model.actions || [];
    const actionValues = modelActions.reduce((memo, action) => {
      memo[action.name] = action.checked;

      return memo;
    }, {});

    const showLabel = (
      <Trans render="h4" className="flush-top">
        Actions (
        <a
          className="clickable"
          onClick={this.handleAllowAllActions.bind(this, actions)}
        >
          Allow All
        </a>
        )
      </Trans>
    );

    return {
      disabled,
      fieldType: "checkbox",
      formElementClass: { "column-12": false },
      formGroupClass:
        "form-group media-object-spacing-wrapper media-object-spacing-narrow media-object-offset",
      labelClass: "media-object-item",
      itemWrapperClass: "media-object media-object-wrap",
      name: "actions",
      validation(value) {
        return value.some((checkbox) => checkbox.checked);
      },
      showLabel,
      validationErrorText: i18n._(t`Please select at least one option.`),
      value: actions.map((name) => ({
        checked: actionValues[name],
        label: StringUtil.capitalize(name),
        name,
      })),
      writeType: "input",
    };
  }
  getFormElementDefinition = (permission, index) => {
    const { model } = this.state;
    const { disabled } = this.props;
    const { name, groupName, rid } = permission;

    const tooltipContent = (
      <Trans render="span">
        <a
          href={MetadataStore.buildDocsURI("/security/ent/perms-management/")}
          target="_blank"
        >
          See documentation
        </a>
        .
      </Trans>
    );

    if (rid === "*") {
      const indexString = index.toString();

      return {
        columnWidth: 4, // Set to 4 so we can disable column class
        disabled,
        fieldType: "text",
        formElementClass: {
          "column-4": false, // Disable column class
          "media-object-item": true,
        },
        name: indexString,
        placeholder: name,
        required: true,
        showError: false,
        showLabel: (
          <label>
            {`${groupName} `}
            <Tooltip
              content={tooltipContent}
              wrapperClassName="tooltip-wrapper"
              wrapText={true}
              maxWidth={300}
              interactive={true}
            >
              <InfoTooltipIcon />
            </Tooltip>
          </label>
        ),
        validation() {
          return true;
        },
        value: model[indexString],
        writeType: "input",
      };
    }

    const items = permission.getItems();
    // Leave out dropdown selection, if there is no or
    // only one choice (will be pre selected)
    if (!items || items.length < 2) {
      return null;
    }

    return {
      columnWidth: 4, // Set to 4 so we can disable column class
      fieldType: "select",
      formElementClass: {
        "column-4": false, // Disable column class
        "media-object-item": true,
      },
      label: groupName,
      showLabel: true,
      options: this.getDropdownItems(permission, index),
      name: rid,
      required: false,
      validation() {
        return true;
      },
      value: model[rid],
      writeType: "input",
    };
  };

  getFormDefinition() {
    const { chosenRIDs } = this.state;
    const permissionSelections = [];

    ACLStore.getPermissionSchema()
      .collectChildren(chosenRIDs)
      .forEach((permission, index) => {
        const formElement = this.getFormElementDefinition(permission, index);
        if (formElement) {
          permissionSelections.push(formElement);
        }
      });

    const definition = [permissionSelections];
    const actionsFormElement = this.getActionCheckboxDefinitions();
    if (actionsFormElement) {
      definition.push(actionsFormElement);
    }

    return definition;
  }
  toggleBulkAdd = () => {
    this.props.handleBulkAddToggle();
  };
  setTriggerSubmit = (triggerSubmit) => {
    this.triggerSubmit = triggerSubmit;
  };

  getManualForm() {
    const { chosenRIDs, model } = this.state;
    const { disabled, errors } = this.props;
    let value = this.getResourceString(model, chosenRIDs);
    const actions = this.getSelectedActions(model.actions).join(",");

    // There's no sense in just showing `dcos` if the user
    // didn't actually pick anything from the wizard.
    if (value === "dcos") {
      value = "";
    } else {
      value += ` ${actions}`;
    }

    const definition = [
      [
        {
          disabled,
          fieldType: "textarea",
          focused: true,
          name: "bulkacls",
          required: true,
          showLabel: false,
          writeType: "input",
          validation() {
            return true;
          },
          value,
        },
      ],
    ];

    if (errors.length) {
      definition[0].validationError = { bulkacls: true };
    }

    const tooltipContent = (
      <Trans render="span">
        Define the permission in a string format. If the permission also
        includes an action, specify the action that should be allowed. Refer to{" "}
        <a
          href={MetadataStore.buildDocsURI("/security/ent/perms-management/")}
          target="_blank"
        >
          the documentation
        </a>{" "}
        for more details.
      </Trans>
    );

    return (
      <div>
        {this.getErrorMessage()}
        <h4>
          <Trans render="span">Permissions Strings</Trans>
          <Tooltip
            content={tooltipContent}
            wrapperClassName="tooltip-wrapper"
            wrapText={true}
            maxWidth={350}
            interactive={true}
          >
            <InfoTooltipIcon />
          </Tooltip>
        </h4>
        <Form
          formGroupClass="form-group flush-bottom"
          definition={definition}
          onError={this.handleError}
          onChange={this.handleBulkFormChange}
          onSubmit={this.handleSubmit}
          triggerSubmit={this.setTriggerSubmit}
        />
      </div>
    );
  }

  getForm() {
    if (this.isBulkAdd()) {
      return this.getManualForm();
    }

    return (
      <div>
        <Trans render="h4">Resource</Trans>
        {this.getErrorMessage()}
        <Form
          className="form flush-bottom media-object-spacing-wrapper media-object-spacing-narrow media-object-offset"
          formRowClass={{
            "media-object media-object-wrap": true,
            row: false,
          }}
          definition={this.getFormDefinition()}
          onError={this.handleError}
          onChange={this.handleFormChange}
          onSubmit={this.handleSubmit}
          triggerSubmit={this.setTriggerSubmit}
        />
      </div>
    );
  }

  getErrorMessage() {
    const { errorMsg } = this.state;
    if (!errorMsg || this.isBulkAdd()) {
      return null;
    }

    return (
      <Trans render="p" className="text-danger flush-top">
        {errorMsg} Go to{" "}
        <a className="clickable" onClick={this.toggleBulkAdd}>
          insert permission string
        </a>{" "}
        to enter a permission manually.
      </Trans>
    );
  }

  getPermissionText() {
    if (this.isBulkAdd()) {
      return "Permissions";
    }
    return "Permission";
  }

  getFooter() {
    const { disabled } = this.props;
    const actions = ACLStore.getPermissionSchema().collectActions(
      this.state.chosenRIDs
    );

    const permisssionText = this.isBulkAdd()
      ? i18nMark("Add Permissions")
      : i18nMark("Add Permission");

    const affirmText = disabled ? i18nMark("Adding...") : permisssionText;

    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        <Trans
          render={
            <button
              className="button button-primary-link flush-left"
              onClick={this.handleClose}
            />
          }
        >
          Close
        </Trans>
        <Trans
          render={
            <button
              className="button button-primary"
              disabled={!this.isBulkAdd() && (disabled || !actions.length)}
              onClick={this.triggerSubmit}
            />
          }
          id={affirmText}
        />
      </div>
    );
  }

  getHeader() {
    return (
      <FilterBar
        className="filter-bar filter-bar-offset"
        rightAlignLastNChildren={1}
      >
        <ModalHeading>
          <Trans render="span">
            Add a Permission for {this.props.subjectID}
          </Trans>
        </ModalHeading>
        <ToggleButton checked={this.isBulkAdd()} onChange={this.toggleBulkAdd}>
          <Trans render="span">Insert Permission String</Trans>
        </ToggleButton>
      </FilterBar>
    );
  }

  getIntroduction() {
    if (this.isBulkAdd()) {
      return (
        <Trans render="p">
          Use the form below to manually enter or paste permissions.{" "}
          <a className="clickable" onClick={this.toggleBulkAdd}>
            Switch to permission builder
          </a>{" "}
          to add a single permission.
        </Trans>
      );
    }

    return (
      <Trans render="p">
        Use the form below to build your permission. For more information see
        the{" "}
        <a
          href={MetadataStore.buildDocsURI("/security/ent/perms-reference/")}
          target="_blank"
          key="docs"
        >
          documentation
        </a>
        . To bulk add permissions,{" "}
        <a className="clickable" onClick={this.toggleBulkAdd}>
          switch to advanced mode
        </a>
        .
      </Trans>
    );
  }

  getMessage() {
    const { disabled, dupesFound, errors, permissionsAddedCount } = this.props;
    let dupeMessages = null;
    let errorMessages = null;
    let errorMessage = null;
    let successMessage = null;

    if (permissionsAddedCount && !disabled) {
      // L10NTODO: Pluralize
      successMessage = (
        <div className="form-row-pad-bottom">
          <InfoBoxInline
            key="successMessage"
            appearance="success"
            message={
              <React.Fragment>
                <div className="flex">
                  <div>
                    <Icon
                      shape={SystemIcons.CircleCheck}
                      size={iconSizeXs}
                      color="currentColor"
                    />
                  </div>
                  <div className="errorsAlert-message">
                    <strong>
                      {permissionsAddedCount}{" "}
                      {StringUtil.pluralize(
                        "Permission",
                        permissionsAddedCount
                      )}{" "}
                      added.
                    </strong>
                  </div>
                </div>
              </React.Fragment>
            }
          />
        </div>
      );
    }

    if (dupesFound.length) {
      // L10NTODO: Pluralize
      dupeMessages = dupesFound
        .slice(0, 5) // Show first five errors.
        .map((duplicate) => (
          <Trans render="li" key={duplicate} className="errorsAlert-listItem">
            Duplicate Resource ID: {duplicate}
          </Trans>
        ));
    }

    if (errors.length) {
      errorMessages = errors
        .slice(0, 5 - dupesFound.length) // Show first five errors.
        .map((errorObject, key) => {
          let preText = "";
          const { action, error, resourceID } = errorObject;

          if (error.indexOf(resourceID) === -1) {
            preText += `For ${resourceID}`;

            if (action && error.indexOf(action) === -1) {
              preText += ` ${action}`;
            }

            preText += ": ";
          } else if (action) {
            preText += `For action ${action}: `;
          }

          return (
            <li key={key} className="errorsAlert-listItem">
              {preText}
              {error}
            </li>
          );
        });
    }

    if (dupesFound.length + errors.length > 5) {
      errorMessages.push(
        <li className="errorsAlert-listItem" key="more">
          <Trans>and {dupesFound.length + errors.length - 5} more.</Trans>
        </li>
      );
    }

    if (errorMessages || dupeMessages) {
      // L10NTODO: Pluralize
      errorMessage = (
        <div className="form-row-pad-bottom">
          <InfoBoxInline
            appearance="danger"
            message={
              <React.Fragment>
                <div className="flex">
                  <div>
                    <Icon
                      shape={SystemIcons.Yield}
                      size={iconSizeXs}
                      color="currentColor"
                    />
                  </div>
                  <div className="errorsAlert-message">
                    <div key="errorHeading">
                      <strong>
                        Unable to add {errors.length + dupesFound.length}{" "}
                        {StringUtil.pluralize(
                          "permission",
                          errors.length + dupesFound.length
                        )}
                        :
                      </strong>
                    </div>
                    <ul className="errorsAlert-list">
                      {dupeMessages}
                      {errorMessages}
                    </ul>
                  </div>
                </div>
              </React.Fragment>
            }
          />
        </div>
      );
    }

    return (
      <div>
        {successMessage}
        {errorMessage}
      </div>
    );
  }

  render() {
    const modalClass = classNames("modal modal-large", {
      "permission-form-modal": !this.isBulkAdd(),
    });

    return (
      <Modal
        bodyClass="permission-form"
        closeByBackdropClick={true}
        footer={this.getFooter()}
        header={this.getHeader()}
        modalClass={modalClass}
        onClose={this.handleClose}
        open={this.props.open}
        scrollContainerClass=""
        showHeader={true}
        showFooter={true}
        showHeader={true}
        useGemini={false}
      >
        <div className="modal-body allow-overflow">
          <div className="text-overflow-break-word">
            {this.getMessage()}
            {this.getIntroduction()}
            {this.getForm()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default withI18n()(PermissionBuilderModal);
