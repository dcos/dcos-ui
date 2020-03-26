import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import * as React from "react";

import AdvancedSectionContent from "./AdvancedSectionContent";
import AdvancedSectionLabel from "./AdvancedSectionLabel";

class AdvancedSection extends React.Component {
  static propTypes = {
    initialIsExpanded: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string,
    ]),
    shouldExpand: PropTypes.bool,
  };
  static getDerivedStateFromProps(nextProps) {
    if (nextProps.shouldExpand) {
      return { isExpanded: true };
    }
    return null;
  }
  constructor(props) {
    super(...arguments);

    this.state = { isExpanded: props.initialIsExpanded === true };
  }
  handleHeadingClick = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  getChildren() {
    return React.Children.map(this.props.children, (child) => {
      if (child.type === AdvancedSectionLabel) {
        return React.cloneElement(child, {
          onClick: this.handleHeadingClick,
          isExpanded: this.state.isExpanded,
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

export default AdvancedSection;
