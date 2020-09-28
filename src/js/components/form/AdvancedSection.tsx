import classNames from "classnames/dedupe";
import * as React from "react";

import AdvancedSectionContent from "./AdvancedSectionContent";
import AdvancedSectionLabel from "./AdvancedSectionLabel";

class AdvancedSection extends React.Component<{
  className: string;
  initialIsExpanded?: boolean;
  shouldExpand?: boolean;
}> {
  static getDerivedStateFromProps(nextProps) {
    return nextProps.shouldExpand ? { isExpanded: true } : null;
  }

  state = { isExpanded: this.props.initialIsExpanded === true };
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
