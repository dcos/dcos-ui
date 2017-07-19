import React, { Component } from "react";
import AceEditor from "react-ace";
import ReactDOM from "react-dom";

import "brace/mode/jsx";
import "brace/mode/html";
import "brace/theme/tomorrow_night";

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

  setMaxHeight(container, editor) {
    var lineHeight = editor.renderer.lineHeight;
    var doc = editor.getSession().getDocument();
    container.style.height = lineHeight * doc.getLength() + "px";
  }

  setHeight(ref) {
    if (ref != null) {
      const editor = ref.editor;
      const container = ReactDOM.findDOMNode(this);
      this.setMaxHeight(container, editor);

      const { height, handleCanExpand } = this.props;

      if (container.clientHeight > height) {
        container.style.height = `${height}px`;
        handleCanExpand(true);
      } else {
        handleCanExpand(false);
      }

      editor.resize();
    }
  }

  render() {
    const { lang } = this.props;
    const theme = "tomorrow_night";

    return (
      <AceEditor
        ref={this.setHeight.bind(this)}
        value={this.props.children}
        onChange={this.updateCode}
        mode={lang}
        theme={theme}
        width="100%"
        readOnly={true}
      />
    );
  }
}

module.exports = CodeExample;
