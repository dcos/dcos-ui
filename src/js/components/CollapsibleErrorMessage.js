import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Icon, InfoBoxBanner } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import PropTypes from "prop-types";
import React from "react";

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

    const labelText = this.state.expanded
      ? i18nMark("(Show less)")
      : i18nMark("(Show more)");

    // Render
    return (
      <Trans
        id={labelText}
        render={
          <span
            className="collapsible-toggle-label clickable"
            onClick={this.toggleExpanded}
          />
        }
      />
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

      return (
        <li key={i} className="errorsAlert-listItem">
          {msg}
        </li>
      );
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
        <span className="icon-alert icon-margin-right">
          <Icon
            shape={SystemIcons.Yield}
            size={iconSizeXs}
            color="currentColor"
          />
        </span>
        {message}
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
          <ul>{this.getDetailsListItems()}</ul>
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

    // Render message component
    return (
      <InfoBoxBanner
        appearance="danger"
        message={
          <div>
            {this.getFixedMessagePart()}
            {this.getCollapsibleMessagePart()}
          </div>
        }
        primaryAction={this.getShowDetailsLink()}
      />
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
  className: PropTypes.string,
  details: PropTypes.array,
  expanded: PropTypes.bool,
  message: PropTypes.node,
  onToggle: PropTypes.func
};

module.exports = CollapsibleErrorMessage;
