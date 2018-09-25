import { Tooltip } from "reactjs-components";
import { MountService } from "foundation-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import { FormReducer as env } from "../../reducers/serviceForm/FormReducers/EnvironmentVariables";
import { FormReducer as labels } from "../../reducers/serviceForm/FormReducers/Labels";

class EnvironmentFormSection extends Component {
  getEnvironmentLines(data) {
    const errors = this.props.errors.env || {};

    return data
      .filter(function(item) {
        return item.value == null || typeof item.value === "string";
      })
      .map((env, key) => {
        let keyLabel = null;
        let valueLabel = null;
        if (key === 0) {
          keyLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  Key
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
          valueLabel = (
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  Value
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
          );
        }
        const isValueWithoutKey = Boolean(!env.key && env.value);

        return (
          <FormRow key={key}>
            <FormGroup
              className="column-6"
              required={false}
              showError={isValueWithoutKey}
            >
              {keyLabel}
              <FieldAutofocus>
                <FieldInput
                  name={`env.${key}.key`}
                  type="text"
                  value={env.key || ""}
                />
              </FieldAutofocus>
              <FieldError>The key cannot be empty.</FieldError>
              <span className="emphasis form-colon">:</span>
            </FormGroup>
            <FormGroup
              className="column-6"
              required={false}
              showError={Boolean(errors[env.key])}
            >
              {valueLabel}
              <FieldInput
                name={`env.${key}.value`}
                type="text"
                value={env.value || ""}
              />
              <FieldError>{errors[env.key]}</FieldError>
            </FormGroup>
            <FormGroup hasNarrowMargins={true} applyLabelOffset={key === 0}>
              <DeleteRowButton
                onClick={this.props.onRemoveItem.bind(this, {
                  value: key,
                  path: "env"
                })}
              />
            </FormGroup>
          </FormRow>
        );
      });
  }

  getLabelsLines(data) {
    const errors = this.props.errors.labels || {};

    return data.map((label, key) => {
      let keyLabel = null;
      let valueLabel = null;
      if (key === 0) {
        keyLabel = (
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Key
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
        );
        valueLabel = (
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Value
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
        );
      }

      const isValueWithoutKey = Boolean(!label.key && label.value);

      return (
        <FormRow key={key}>
          <FormGroup className="column-6" showError={isValueWithoutKey}>
            {keyLabel}
            <FieldAutofocus>
              <FieldInput
                name={`labels.${key}.key`}
                type="text"
                value={label.key || ""}
              />
            </FieldAutofocus>
            <FieldError>The key cannot be empty.</FieldError>
            <span className="emphasis form-colon">:</span>
          </FormGroup>
          <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(errors[label.key])}
          >
            {valueLabel}
            <FieldInput
              name={`labels.${key}.value`}
              type="text"
              value={label.value || ""}
            />
            <FieldError>{errors[label.key]}</FieldError>
          </FormGroup>
          <FormGroup hasNarrowMargins={true} applyLabelOffset={key === 0}>
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(this, {
                value: key,
                path: "labels"
              })}
            />
          </FormGroup>
        </FormRow>
      );
    });
  }

  render() {
    const { data, errors } = this.props;

    const envTooltipContent = (
      <span>
        {
          "DC/OS also exposes environment variables for host ports and metdata. "
        }
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/service-ports/#environment-variables"
          )}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );
    const labelsTooltipContent = (
      <span>
        {
          "For example, you could label services “staging” and “production” to mark them by their position in the pipeline. "
        }
        <a
          href={MetadataStore.buildDocsURI("/tutorials/task-labels/")}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Environment
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <p>
          Configure any environment values to be attached to each instance that
          is launched.
        </p>
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Environment Variables
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={envTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <p>
          Set up environment variables for each instance your service launches.
        </p>
        {this.getEnvironmentLines(data.env)}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                path: "env"
              })}
            >
              Add Environment Variable
            </AddButton>
          </FormGroup>
        </FormRow>
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Labels
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={labelsTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <p>
          Attach metadata to expose additional information to other services.
        </p>
        {this.getLabelsLines(data.labels)}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: data.labels.length,
                path: "labels"
              })}
            >
              Add Label
            </AddButton>
          </FormGroup>
        </FormRow>
        <MountService.Mount
          type={this.props.mountType}
          data={data}
          errors={errors}
          onAddItem={this.props.onAddItem.bind(this)}
          onRemoveItem={this.props.onRemoveItem.bind(this)}
        />
      </div>
    );
  }
}

EnvironmentFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {},
  mountType: "CreateService:EnvironmentFormSection"
};

EnvironmentFormSection.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func,
  mountType: PropTypes.string
};

EnvironmentFormSection.configReducers = {
  env,
  labels
};

module.exports = EnvironmentFormSection;
