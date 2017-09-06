import React, { Component } from "react";
import deepEqual from "deep-equal";
import { Tooltip } from "reactjs-components";
import DefaultSchemaField
  from "react-jsonschema-form/lib/components/fields/SchemaField";

import Icon from "#SRC/js/components/Icon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldSelect from "#SRC/js/components/form/FieldSelect";

class SchemaField extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      !deepEqual(nextProps.formData, this.props.formData) ||
      !deepEqual(nextProps.uiSchema, this.props.uiSchema)
    );
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.schema.type !== "object" &&
      prevProps.formData !== this.props.formData
    ) {
      this.props.onChange(this.props.formData);
    }
  }

  renderCheckbox(errorMessage, props) {
    const { required, name, schema, formData, onChange } = props;

    return (
      <FieldLabel>
        <FieldInput
          id={name}
          type={"checkbox"}
          name={name}
          checked={formData}
          onChange={event => onChange(event.target.checked)}
        />
        {this.getFieldHeading(required, name, schema.description)}
        <FieldError>{errorMessage}</FieldError>
      </FieldLabel>
    );
  }

  renderRadioButtons(errorMessage, props) {
    const { required, name, schema, formData, onChange } = props;

    const options = schema.enum.map(option => {
      return (
        <FieldLabel>
          <FieldInput
            type={"radio"}
            value={option}
            name={name}
            checked={option === formData}
            onChange={_ => onChange(option)}
          />
          {option}
        </FieldLabel>
      );
    });

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        {options}
      </div>
    );
  }

  renderSelect(errorMessage, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      autofocus,
      onFocus
    } = props;

    const options = schema.enum.map(option => {
      return <option value={option}>{option}</option>;
    });

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        <FieldSelect
          id={name}
          autoFocus={autofocus}
          className={"field-select-narrow"}
          name={name}
          type="text"
          value={formData}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur && (event => onBlur(name, event.target.value))}
          onFocus={onFocus && (event => onFocus(name, event.target.value))}
        >
          {options}
        </FieldSelect>
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  renderTextInput(errorMessage, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      autofocus,
      onFocus
    } = props;

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        <FieldInput
          id={name}
          type={"text"}
          className={"field-input-text-narrow"}
          autoFocus={autofocus}
          name={name}
          value={formData}
          onChange={event => onChange(event.target.value)}
          onBlur={onBlur && (event => onBlur(name, event.target.value))}
          onFocus={onFocus && (event => onFocus(name, event.target.value))}
        />
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  renderNumberInput(errorMessage, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      autofocus,
      onFocus
    } = props;

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        <FieldInput
          id={name}
          type={"number"}
          className={"field-input-number-narrow"}
          autoFocus={autofocus}
          name={name}
          value={formData}
          onChange={event => onChange(Number(event.target.value))}
          onBlur={onBlur && (event => onBlur(name, event.target.value))}
          onFocus={onFocus && (event => onFocus(name, event.target.value))}
        />
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  getFieldHeading(required, name, description) {
    let asterisk = null;
    if (required) {
      asterisk = (
        <FormGroupHeadingContent className="text-danger" primary={false}>
          *
        </FormGroupHeadingContent>
      );
    }

    return (
      <FormGroupHeading>
        <FormGroupHeadingContent primary={true}>
          {name.split("_").join(" ")}
        </FormGroupHeadingContent>
        {asterisk}
        <FormGroupHeadingContent primary={false}>
          <Tooltip
            content={description}
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    );
  }

  getFieldContent(errorMessage) {
    const { schema } = this.props;
    const RADIO_SELECT_THRESHOLD = 4;

    if (schema.type === "boolean") {
      return this.renderCheckbox(errorMessage, this.props);
    } else if (schema.enum && schema.enum.length <= RADIO_SELECT_THRESHOLD) {
      return this.renderRadioButtons(errorMessage, this.props);
    } else if (schema.enum && schema.enum.length > RADIO_SELECT_THRESHOLD) {
      return this.renderSelect(errorMessage, this.props);
    } else if (schema.type === "string") {
      return this.renderTextInput(errorMessage, this.props);
    } else if (schema.type === "number" || schema.type === "integer") {
      return this.renderNumberInput(errorMessage, this.props);
    }
  }

  render() {
    const { schema, errorSchema } = this.props;

    if (schema.type === "object") {
      return <DefaultSchemaField {...this.props} />;
    }

    let errorMessage = "";
    if (errorSchema) {
      errorMessage = errorSchema.__errors[0];
    }

    return (
      <FormGroup
        showError={Boolean(errorMessage)}
        errorClassName="form-group-danger"
      >
        {this.getFieldContent(errorMessage)}
      </FormGroup>
    );
  }
}

export default SchemaField;
