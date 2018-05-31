import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import AdvancedSectionContent from "./AdvancedSectionContent";
import AdvancedSectionLabel from "./AdvancedSectionLabel";

const METHODS_TO_BIND = ["handleHeadingClick"];

class AdvancedSection extends React.Component {
  constructor(props) {
    super(...arguments);

    this.state = { isExpanded: props.initialIsExpanded === true };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleHeadingClick() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  getChildren() {
    return React.Children.map(this.props.children, child => {
      if (child.type === AdvancedSectionLabel) {
        return React.cloneElement(child, {
          onClick: this.handleHeadingClick,
          isExpanded: this.state.isExpanded
        });
      }

      if (child.type === AdvancedSectionContent && !this.state.isExpanded) {
        return null;
      }

      return child;
    });
  }

  render() {
    const classes = classNames("advanced-section", this.props.className);

    return <div className={classes}>{this.getChildren()}</div>;
  }
}

AdvancedSection.propTypes = {
  initialIsExpanded: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ])
};

module.exports = AdvancedSection;
