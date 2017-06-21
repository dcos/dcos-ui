import React from "react";

import FormUtil from "../utils/FormUtil";
import SchemaForm from "./SchemaForm";

const METHODS_TO_BIND = ["handleFormChange", "validateForm"];

const SCHEDULE_FIELDS = ["cron", "timezone", "startingDeadlineSeconds"];

const DUPLICABLE_FIELDS_TO_WATCH = {};

const FIELDS_TO_WATCH = {
  runOnSchedule: {
    forceUpdate: true
  }
};

class JobForm extends SchemaForm {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    this.multipleDefinition = this.getNewDefinition();

    this.props.getTriggerSubmit(this.handleExternalSubmit);
  }

  shouldUpdateDefinition(changes, eventType, fieldName) {
    const propKey = FormUtil.getPropKey(fieldName);
    const blurChange = Object.values(DUPLICABLE_FIELDS_TO_WATCH).some(function(
      item
    ) {
      return item.blurOnly && item.blurOnly.includes(propKey);
    });

    return (
      Object.keys(changes).some(function(changeKey) {
        const tab = FormUtil.getProp(changeKey);

        return (
          (tab in DUPLICABLE_FIELDS_TO_WATCH &&
            (DUPLICABLE_FIELDS_TO_WATCH[tab].fields.includes(propKey) &&
              DUPLICABLE_FIELDS_TO_WATCH[tab].forceUpdate)) ||
          (fieldName in FIELDS_TO_WATCH &&
            FIELDS_TO_WATCH[fieldName].forceUpdate)
        );
      }) ||
      (eventType === "blur" && blurChange)
    );
  }

  handleFormChange(changes, eventObj) {
    const { eventType, fieldName } = eventObj;

    if (!this.shouldUpdateDefinition(changes, eventType, fieldName)) {
      return;
    }

    // Fetch the updated model from the <Form /> component
    // nested deeper in the component tree.
    this.model = this.triggerTabFormSubmit();

    // Re-generate the definition in order to reset all errors.
    // The first argument tells the `getNewDefinition` function to fuse
    // the contents of the model into the definition.
    this.multipleDefinition = this.getNewDefinition(this.model);

    // Forward the onChange event to the parent
    // The parent is responsible for updating the form with the new model
    // in order to reflect the changes
    this.props.onChange(this.getDataTriple());

    // Force an update if we have clicked on the checkbox
    if (eventObj.fieldName === "runOnSchedule") {
      this.forceUpdate();
    }
  }

  handleTabClick(tab) {
    this.props.onTabChange(tab);
  }

  validateForm() {
    let isValidated = true;
    this.model = this.triggerTabFormSubmit();
    this.multipleDefinition = this.getNewDefinition(this.model);

    // Apply all validations.
    FormUtil.forEachDefinition(this.multipleDefinition, definition => {
      definition.showError = false;

      if (typeof definition.externalValidator !== "function") {
        return;
      }

      const fieldValidated = definition.externalValidator(
        this.model,
        definition
      );
      if (!fieldValidated) {
        isValidated = false;
      }
    });

    // Force an update only if we have changed validation state
    if (this.isValidated !== isValidated) {
      this.forceUpdate();
    }

    // Return validation status
    this.isValidated = isValidated;

    return isValidated;
  }

  // Fallback to props model, if provided model is not defined,
  // i.e. more up to date
  getNewDefinition(model = this.props.model) {
    const multipleDefinition = super.getNewDefinition();

    const scheduleEnabled = model.schedule.runOnSchedule;
    if (!scheduleEnabled) {
      multipleDefinition.schedule.definition.forEach(function(definition) {
        if (SCHEDULE_FIELDS.includes(definition.name)) {
          definition.formElementClass = "hidden";
          definition.value = null;
        }
      });
    }

    return multipleDefinition;
  }
}

JobForm.defaultProps = {
  className: "multiple-form",
  defaultTab: "",
  getTriggerSubmit() {},
  isEdit: false,
  onChange() {},
  onTabChange() {},
  schema: {}
};

JobForm.propTypes = {
  className: React.PropTypes.string,
  defaultTab: React.PropTypes.string,
  isEdit: React.PropTypes.bool,
  getTriggerSubmit: React.PropTypes.func,
  onChange: React.PropTypes.func,
  onTabChange: React.PropTypes.func,
  schema: React.PropTypes.object
};

module.exports = JobForm;
