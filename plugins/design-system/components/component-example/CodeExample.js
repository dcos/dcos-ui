import React, { Component } from "react";
import AceEditor from "react-ace";
import ReactDOM from "react-dom";

import "brace/mode/jsx";
import "brace/mode/html";
import "brace/theme/tomorrow_night";

const SUPPORTED_CODE_TYPES = ["jsx", "html"];
const SUPPORTED_THEMES = ["tomorrow_night"];

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
    const lineHeight = editor.renderer.lineHeight;
    const doc = editor.getSession().getDocument();
    container.style.height = lineHeight * doc.getLength() + "px";
  }

  setHeight(ref) {
    const { height, handleCanExpand } = this.props;

    if (ref != null) {
      const editor = ref.editor;
      const container = ReactDOM.findDOMNode(this);
      const heightParam = `${height}px`;

      if (!height) {
        this.setMaxHeight(container, editor);
      } else if (!handleCanExpand) {
        container.style.height = heightParam;
      } else {
        this.setMaxHeight(container, editor);

        if (container.clientHeight > height) {
          container.style.height = heightParam;
          handleCanExpand(true);
        } else {
          handleCanExpand(false);
        }
      }

      editor.resize();
    }
  }

  render() {
    const { lang, theme, width, children, readOnly } = this.props;

    return (
      <AceEditor
        ref={this.setHeight.bind(this)}
        value={children}
        onChange={this.updateCode}
        mode={lang}
        theme={theme}
        width={width}
        readOnly={readOnly}
      />
    );
  }
}

CodeExample.defaultProps = {
  theme: "tomorrow_night",
  width: "100%",
  readOnly: true
};

CodeExample.propTypes = {
  width: React.PropTypes.string,
  theme: React.PropTypes.oneOf(SUPPORTED_THEMES),
  handleCanExpand: React.PropTypes.func,
  height: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
  readOnly: React.PropTypes.bool,
  lang: React.PropTypes.oneOf(SUPPORTED_CODE_TYPES).isRequired,
  children: React.PropTypes.node.isRequired
};

module.exports = CodeExample;
