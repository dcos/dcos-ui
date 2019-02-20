import React, { Component } from "react";
import isEqual from "lodash.isequal";
import { Tooltip } from "reactjs-components";
import DefaultSchemaField from "react-jsonschema-form/lib/components/fields/SchemaField";
import { MountService } from "foundation-ui";
import StringUtil from "#SRC/js/utils/StringUtil";

import Icon from "#SRC/js/components/Icon";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";

class SchemaField extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      !isEqual(nextProps.formData, this.props.formData) ||
      !isEqual(nextProps.uiSchema, this.props.uiSchema) ||
      !isEqual(nextProps.errorSchema, this.props.errorSchema)
    );
  }

  componentDidMount() {
    // trigger an onChange for the top-most schema field
    // this will trigger validation in FrameworkConfiguration
    if (!this.props.name) {
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
        <FieldLabel key={option}>
          <FieldInput
            type={"radio"}
            value={option}
            checked={option === formData}
            onChange={() => onChange(option)}
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

  renderSelect(errorMessage, autofocus, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      onFocus
    } = props;

    const options = schema.enum.map(option => {
      return (
        <option key={option} value={option}>
          {option}
        </option>
      );
    });

    let field = (
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
    );
    if (autofocus) {
      field = <FieldAutofocus>{field}</FieldAutofocus>;
    }

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        {field}
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  renderTextInput(errorMessage, autofocus, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      onFocus
    } = props;

    const handleChange = event => {
      const value = event.target.value;

      if (value === "" && !required) {
        onChange(undefined);
      } else {
        onChange(value);
      }
    };

    let field = (
      <FieldInput
        id={name}
        type={"text"}
        className={"field-input-text-narrow"}
        autoFocus={autofocus}
        name={name}
        value={formData}
        onChange={handleChange}
        onBlur={onBlur && (event => onBlur(name, event.target.value))}
        onFocus={onFocus && (event => onFocus(name, event.target.value))}
      />
    );
    if (autofocus) {
      field = <FieldAutofocus>{field}</FieldAutofocus>;
    }

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        {field}
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  renderNumberInput(errorMessage, autofocus, props) {
    const {
      required,
      name,
      schema,
      formData,
      onChange,
      onBlur,
      onFocus
    } = props;

    const handleChange = event => {
      const value = event.target.value;

      if (value === "" && !required) {
        onChange(undefined);
      } else if (value === "") {
        onChange("");
      } else {
        onChange(Number(value));
      }
    };

    let field = (
      <FieldInput
        id={name}
        type={"number"}
        className={"field-input-number-narrow"}
        autoFocus={autofocus}
        name={name}
        value={formData}
        onChange={handleChange}
        onBlur={onBlur && (event => onBlur(name, event.target.value))}
        onFocus={onFocus && (event => onFocus(name, event.target.value))}
      />
    );
    if (autofocus) {
      field = <FieldAutofocus>{field}</FieldAutofocus>;
    }

    return (
      <div>
        <FieldLabel>
          {this.getFieldHeading(required, name, schema.description)}
        </FieldLabel>
        {field}
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  getFieldHeading(required, name = "", description) {
    let requiredSymbol = null;
    if (required) {
      requiredSymbol = (
        <FormGroupHeadingContent className="text-danger" primary={false}>
          *
        </FormGroupHeadingContent>
      );
    }

    return (
      <FormGroupHeading>
        <FormGroupHeadingContent primary={true}>
          {StringUtil.capitalizeEveryWord(name)}
        </FormGroupHeadingContent>
        {requiredSymbol}
        <FormGroupHeadingContent primary={false}>
          <Tooltip
            content={description}
            interactive={true}
            maxWidth={300}
            wrapText={true}
          >
            <Icon color="light-grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    );
  }

  getFieldContent(errorMessage, autofocus) {
    const { schema, required, name } = this.props;
    const RADIO_SELECT_THRESHOLD = 4;

    if (schema.media) {
      return (
        <MountService.Mount
          type={`SchemaField:${schema.media.type}`}
          limit={1}
          schema={schema}
          errorMessage={errorMessage}
          autofocus={autofocus}
          fieldProps={this.props}
          label={this.getFieldHeading(required, name, schema.description)}
        >
          {this.renderTextInput(errorMessage, autofocus, this.props)}
        </MountService.Mount>
      );
    }

    switch (schema.type) {
      case "boolean":
        return this.renderCheckbox(errorMessage, this.props);
      case "string":
        if (schema.enum && schema.enum.length <= RADIO_SELECT_THRESHOLD) {
          return this.renderRadioButtons(errorMessage, this.props);
        }

        if (schema.enum && schema.enum.length > RADIO_SELECT_THRESHOLD) {
          return this.renderSelect(errorMessage, autofocus, this.props);
        }

        return this.renderTextInput(errorMessage, autofocus, this.props);
      case "integer":
        return this.renderNumberInput(errorMessage, autofocus, this.props);
      case "number":
        return this.renderNumberInput(errorMessage, autofocus, this.props);
      default:
        return this.renderTextInput(errorMessage, autofocus, this.props);
    }
  }

  render() {
    const { schema, errorSchema, uiSchema, registry, idSchema } = this.props;

    if (schema.type === "object") {
      const nextLevel =
        idSchema.$id === "root" ? 0 : registry.formContext.level + 1;
      const nextRegistry = {
        ...registry,
        formContext: { level: nextLevel }
      };

      return <DefaultSchemaField {...this.props} registry={nextRegistry} />;
    }

    const autofocus = uiSchema && uiSchema["ui:autofocus"];

    let errorMessage;
    let showError = false;
    if (errorSchema) {
      errorMessage = errorSchema.__errors.map(error => {
        return <div>{error}</div>;
      });
      showError = errorMessage.length > 0;
    }

    return (
      <FormGroup showError={showError} errorClassName="form-group-danger">
        {this.getFieldContent(errorMessage, autofocus)}
      </FormGroup>
    );
  }
}

module.exports = SchemaField;
