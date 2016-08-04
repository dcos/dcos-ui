
import Icon from './Icon';

import React from 'react';
import classNames from 'classnames';

/**
 * An error bar component commonly used in the ServiceForm and the JobsForm
 * that contains collapsible error messages.
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

  }

  /**
   * Toggle the expanded state of the collapsible error bar
   */
  toggleExpanded() {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  /**
   * React.js Render Function
   *
   * @returns {React.Component} - The rendered content
   */
  render() {
    let {message, details} = this.props;
    let isVisible = !!message;
    let isDetailed = isVisible && details && details.length;
    let contents = [];

    // For sure, create a message body
    contents.push(
        <div key="fixed" className="collapsible-fixed text-align-center text-danger flush-top">
          <Icon
            family="mini"
            id="yield"
            size="mini"
            className="icon-alert icon-margin-right"
            color="red" />
          {message}
          {(() => {
            if (isDetailed) {
              return (
                  <span>
                    &nbsp;
                    <span
                      className="text-danger clickable"
                      onClick={this.toggleExpanded.bind(this)}>
                      <small>(Show {this.state.expanded ? 'less' : 'more'})</small>
                    </span>
                  </span>
                );
            }
          })()}
        </div>
      );

    // If we have details, create a floating element below
    // that will show them
    if (isDetailed && this.state.expanded) {
      contents.push(
          <div key="floating" className="collapsible-floating">
            <div className="text-danger">
              <ul>
              {details.map(function (message) {
                let msg = message.toString();
                return (
                    <li key={msg}>{msg}</li>
                  );
              })}
              </ul>
            </div>
          </div>
        );
    };

    // Return the composite or nothing if not visible
    if (isVisible) {
      return (
          <div className={classNames('collapsible-error-message', { 'expanded': this.state.expanded })}>
            {contents}
          </div>
        );

    } else {
      // Nothing to render
      return false;

    }

  };

};

module.exports = CollapsibleErrorMessage;
