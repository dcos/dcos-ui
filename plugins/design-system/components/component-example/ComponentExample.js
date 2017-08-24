import React, { Component } from "react";
import ReactDOMServer from "react-dom/server";
import reactElementToJSXString from "react-element-to-jsx-string";

import StringUtil from "#SRC/js/utils/StringUtil";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Icon from "#SRC/js/components/Icon";

import CodeExample from "./CodeExample";
import CodeExampleFooter from "./CodeExampleFooter";
import CodeExampleHeader from "./CodeExampleHeader";

import CodeExampleTabButtonList from "./CodeExampleTabButtonList";
import CodeExampleTabs from "./CodeExampleTabs";
import CodeExampleTabView from "./CodeExampleTabView";
import CodeExampleTabViewList from "./CodeExampleTabViewList";
import CodeExampleTabButton from "./CodeExampleTabButton";

import ExpandButton from "./ExpandButton";
import CollapseButton from "./CollapseButton";

const DEFAULT_HEIGHT = 205;

const REACT_STRING_OPTIONS = {
  showDefaultProps: false,
  useBooleanShorthandSyntax: false
};

const TABS = {
  React: {
    label: "REACT",
    id: "react"
  },
  Html: {
    label: "HTML",
    id: "html"
  }
};

const METHODS_TO_BIND = [
  "toggleExpandCollapse",
  "handleTabChange",
  "handleCodeCopy",
  "handleCanExpand"
];

class ComponentExample extends Component {
  constructor() {
    super(...arguments);

    const activeTab = this.isTabbedMode()
      ? this.props.activeTab || TABS.React.id
      : null;

    this.state = {
      isExpanded: false,
      isCodeCopied: false,
      canExpand: false,
      activeTab
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  showPreview() {
    return this.props.showPreview && this.props.preview;
  }

  isSingleBlockMode() {
    return (
      (this.props.showReact || this.props.showHtml) &&
      this.props.showHtml !== this.props.showReact
    );
  }

  isTabbedMode() {
    return this.props.showReact && this.props.showHtml;
  }

  isReactMode() {
    return this.isSingleBlockMode() && this.props.showReact;
  }

  isShowingReactCode() {
    return this.isReactMode() || this.state.activeTab === TABS.React.id;
  }

  getHtmlCode(jsxCode) {
    const { htmlCode } = this.props;

    return StringUtil.formatMarkdown(
      ReactDOMServer.renderToStaticMarkup(htmlCode || jsxCode)
    );
  }

  getReactCode(jsxCode) {
    const { reactCode } = this.props;

    return reactElementToJSXString(reactCode || jsxCode, REACT_STRING_OPTIONS);
  }

  toggleExpandCollapse() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  handleTabChange(activeTab) {
    this.setState({
      activeTab,
      isExpanded: false
    });
  }

  handleCanExpand(canExpand) {
    this.setState({ canExpand });
  }

  handleCodeCopy() {
    this.setState({ isCodeCopied: true });
  }

  getCodeBody(lang, code) {
    const defaultHeight = this.props.defaultHeight;
    const height = this.state.isExpanded ? "100%" : defaultHeight;

    return (
      <CodeExample
        lang={lang}
        height={height}
        handleCanExpand={this.handleCanExpand}
      >
        {`${code}`}
      </CodeExample>
    );
  }

  getFooter() {
    const toggleButton = this.state.isExpanded
      ? <CollapseButton onClick={this.toggleExpandCollapse} />
      : <ExpandButton onClick={this.toggleExpandCollapse} />;

    return (
      <CodeExampleFooter>
        {this.state.isExpanded || this.state.canExpand ? toggleButton : ""}
      </CodeExampleFooter>
    );
  }

  render() {
    const { preview } = this.props;

    const reactCode = this.getReactCode(preview);
    const htmlCode = this.getHtmlCode(preview);

    const exampleHeader = (
      <CodeExampleHeader>
        {preview}
      </CodeExampleHeader>
    );

    const clipboard = (
      <ClipboardTrigger
        className="clickable"
        copyText={this.isShowingReactCode() ? reactCode : htmlCode}
        onTextCopy={this.handleCodeCopy}
        useTooltip={true}
      >
        <Icon size="small" id="clipboard" />
      </ClipboardTrigger>
    );

    const reactCodeExample = this.getCodeBody("jsx", reactCode);
    const htmlCodeExample = this.getCodeBody("html", htmlCode);

    const codeBody = (
      <div>
        <div className="code-example-heading single">
          {clipboard}
        </div>
        {this.isReactMode() ? reactCodeExample : htmlCodeExample}
      </div>
    );

    const tabsBody = (
      <CodeExampleTabs
        handleTabChange={this.handleTabChange}
        activeTab={this.state.activeTab}
      >
        <CodeExampleTabButtonList className="tabs">
          <CodeExampleTabButton id={TABS.React.id} label={TABS.React.label} />
          <CodeExampleTabButton id={TABS.Html.id} label={TABS.Html.label} />
          {clipboard}
        </CodeExampleTabButtonList>
        <CodeExampleTabViewList>
          <CodeExampleTabView id={TABS.React.id}>
            {reactCodeExample}
          </CodeExampleTabView>
          <CodeExampleTabView id={TABS.Html.id}>
            {htmlCodeExample}
          </CodeExampleTabView>
        </CodeExampleTabViewList>
      </CodeExampleTabs>
    );

    const header = this.showPreview() ? exampleHeader : null;

    let body = null;
    if (this.isTabbedMode()) {
      body = tabsBody;
    } else if (this.isSingleBlockMode()) {
      body = codeBody;
    }

    const footer = body ? this.getFooter() : null;

    return (
      <div>
        {header}
        {body}
        {footer}
      </div>
    );
  }
}

ComponentExample.defaultProps = {
  defaultHeight: DEFAULT_HEIGHT,
  showReact: true,
  showHtml: true,
  showPreview: true
};

ComponentExample.propTypes = {
  activeTab: React.PropTypes.string,
  defaultHeight: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
  reactCode: React.PropTypes.node,
  htmlCode: React.PropTypes.node,
  preview: React.PropTypes.node,
  showReact: React.PropTypes.bool,
  showHtml: React.PropTypes.bool,
  showPreview: React.PropTypes.bool
};

module.exports = ComponentExample;
