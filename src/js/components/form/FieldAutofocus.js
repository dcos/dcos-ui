import React from "react";
import ReactDOM from "react-dom";
import DOMUtils from "#SRC/js/utils/DOMUtils";

let lockFieldAutofocus = false;

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

export default FieldAutofocus;
