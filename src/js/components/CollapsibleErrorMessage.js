import classNames from "classnames/dedupe";
import React from "react";

import Icon from "./Icon";

/**
 * Methods to bind in 'this' context
 */
const METHODS_TO_BIND = ["toggleExpanded"];

/**
 * An error bar component commonly used in the ServiceForm and the JobsForm
 * that contains collapsible error messages.
 *
 * @example <caption>How to use the CollapsibleErrorMessage</caption>
 *   <CollapsibleErrorMessage
 *
 *        className="error-for-modal"
 *
 *        details={[ 'an', 'array', 'of', 'detailed errors' ]}
 *        message="The message to display"
 *
 *        onToggle={function(isToggled) {
 *          // Do something
 *        }}
 *
 *      />
 */
class CollapsibleErrorMessage extends React.Component {
  /**
   * Initialize superclass
   */
  constructor() {
    super(...arguments);

    // Initial state
    this.state = {
      expanded: false
    };

    // Bind methods in context
    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * Set the default expanded state from the properties
   */
  componentWillMount() {
    this.setState({
      expanded: this.props.expanded
    });
  }

  /**
   * Toggle the expanded state of the collapsible error bar
   */
  toggleExpanded() {
    const expanded = !this.state.expanded;
    this.setState({ expanded });

    // Call onToggle callback
    this.props.onToggle(expanded);
  }

  /**
   * The show more/less link
   *
   * @returns {React.Component|null} - The rendered content
   */
  getShowDetailsLink() {
    const { message, details } = this.props;

    // Check if we must not show the detail link at all
    if (!message || !details || !details.length) {
      return null;
    }

    // Get text
    let moreLess = "more";
    if (this.state.expanded) {
      moreLess = "less";
    }

    // Render
    return (
      <span
        className="collapsible-toggle-label clickable"
        onClick={this.toggleExpanded}
      >
        (Show {moreLess})
      </span>
    );
  }

  /**
   * The list of errors in the details
   *
   * @returns {React.Component} - The rendered content
   */
  getDetailsListItems() {
    const { details } = this.props;

    return details.map(function(message, i) {
      const msg = message.toString();

      return <li key={i}>{msg}</li>;
    });
  }

  /**
   * The fixed message part
   *
   * @returns {React.Component|null} - The rendered content
   */
  getFixedMessagePart() {
    const { message } = this.props;

    // If not visible, just exit
    if (!message) {
      return null;
    }

    // Render the fixed part of the message
    return (
      <div className="collapsible-fixed">
        <Icon
          className="icon-alert icon-margin-right"
          color="red"
          id="yield"
          size="mini"
        />
        {message}
        {this.getShowDetailsLink()}
      </div>
    );
  }

  /**
   * [Custom component] The toggled message part
   *
   * @returns {React.Component|null} - The rendered content
   */
  getCollapsibleMessagePart() {
    const { message, details } = this.props;
    const isDetailed = !!message && details && details.length;

    // If not expanded or detailed, just exit
    if (!isDetailed || !this.state.expanded) {
      return null;
    }

    // Render the toggled part of the message
    // (Note: The nested div is used to float the contents when needed)
    return (
      <div className="collapsible-toggled">
        <div>
          <ul>
            {this.getDetailsListItems()}
          </ul>
        </div>
      </div>
    );
  }

  /**
   * React.js Render Function
   *
   * @returns {React.Component|null} - The rendered content
   */
  render() {
    const { message } = this.props;

    // If not visible, just exit
    if (!message) {
      return null;
    }

    // Compile classes
    const className = classNames(
      "collapsible-error-message",
      { expanded: this.state.expanded },
      this.props.className
    );

    // Render message component
    return (
      <div className={className}>
        {this.getFixedMessagePart()}
        {this.getCollapsibleMessagePart()}
      </div>
    );
  }
}

CollapsibleErrorMessage.defaultProps = {
  className: "",
  details: null,
  expanded: false,
  message: "",
  onToggle() {}
};

CollapsibleErrorMessage.propTypes = {
  className: React.PropTypes.string,
  details: React.PropTypes.array,
  expanded: React.PropTypes.bool,
  message: React.PropTypes.node,
  onToggle: React.PropTypes.func
};

module.exports = CollapsibleErrorMessage;
