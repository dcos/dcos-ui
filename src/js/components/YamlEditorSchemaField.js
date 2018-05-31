import PropTypes from "prop-types";
import React, { Component } from "react";
import AceEditor from "react-ace";
import "brace/mode/yaml";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldError from "#SRC/js/components/form/FieldError";

export default class YamlEditorSchemaField extends Component {
  render() {
    const { errorMessage, label } = this.props;
    const { formData, onChange } = this.props.fieldProps;

    let decodedValue;
    try {
      decodedValue = atob(formData);
    } catch (error) {
      if (error instanceof DOMException) {
        decodedValue = "Invalid base64 encoding detected.";
      }
    }

    return (
      <div>
        <FieldLabel>{label}</FieldLabel>
        <div>
          <AceEditor
            mode="yaml"
            value={decodedValue}
            height="300"
            width=""
            className="framework-form-yaml-editor"
            highlightActiveLine={false}
            fontSize={14}
            showPrintMargin={false}
            tabSize={2}
            onChange={value => onChange(btoa(value))}
          />
        </div>
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }
}

YamlEditorSchemaField.propTypes = {
  label: PropTypes.string.isRequired,
  fieldProps: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  errorMessage: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  autofocus: PropTypes.boolean,
  onChange: PropTypes.func
};
