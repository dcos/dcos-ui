import React from "react";
import ReactDOM from "react-dom";
import DOMUtils from "#SRC/js/utils/DOMUtils";

let lockFieldAutofocus = false;
const SUPPORTED_TYPES = ["FieldInput", "FieldTextarea", "input", "textarea"];

class FieldAutofocus extends React.Component {
  componentDidMount() {
    if (lockFieldAutofocus) {
      return;
    }
    const input = DOMUtils.getInputElement(ReactDOM.findDOMNode(this));
    if (!input) {
      return;
    }
    lockFieldAutofocus = true;
    input.focus();

    input.addEventListener("blur", function onBlurInput() {
      lockFieldAutofocus = false;
      this.removeEventListener("blur", onBlurInput);
    });
  }

  render() {
    return this.props.children;
  }
}

FieldAutofocus.propTypes = {
  children(props, propName, componentName) {
    const prop = props[propName];
    if (
      React.Children.count(prop) !== 1 ||
      !SUPPORTED_TYPES.includes(prop.type.name)
    ) {
      return new Error(
        `${componentName} should have a single child of the following types: ${SUPPORTED_TYPES.join(", ")}.`
      );
    }
  }
};

module.exports = FieldAutofocus;
