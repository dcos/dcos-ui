import React, { Component } from "react";
import ReactCodeMirror from "react-codemirror";
import "../../vendor/simplescrollbars.js";

require("codemirror/mode/jsx/jsx");

class CodeExample extends Component {
  updateCode(newCode) {
    this.setState({
      code: newCode
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.lang !== nextProps.lang ||
      this.props.height !== nextProps.height ||
      (nextState != null && this.state.code !== nextState.code)
    );
  }

  setHeight(ref) {
    if (ref != null) {
      const { height, handleCanExpand } = this.props;
      const cm = ref.getCodeMirror();

      cm.setSize(null, "100%");
      if (cm.doc.height > height) {
        cm.setSize(null, height);
        handleCanExpand(true);
      } else {
        handleCanExpand(false);
      }
    }
  }

  render() {
    const { lang } = this.props;
    var options = {
      lineNumbers: true,
      mode: lang,
      theme: "one-dark",
      scrollbarStyle: "overlay",
      readOnly: true
    };

    return (
      <ReactCodeMirror
        ref={this.setHeight.bind(this)}
        value={this.props.children}
        onChange={this.updateCode}
        options={options}
      />
    );
  }
}

module.exports = CodeExample;
