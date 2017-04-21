import classNames from "classnames";
import React from "react";

class BreadcrumbSupplementalContent extends React.Component {
  render() {
    const { children, hasStatusBar } = this.props;

    if (!children) {
      return null;
    }

    const classes = classNames(
      "breadcrumb__content breadcrumb__content--supplemental",
      { "breadcrumb__content--has-status-bar": hasStatusBar }
    );

    return (
      <div className={classes}>
        {children}
      </div>
    );
  }
}

BreadcrumbSupplementalContent.defaultProps = {
  hasStatusBar: false
};

BreadcrumbSupplementalContent.propTypes = {
  hasStatusBar: React.PropTypes.bool
};

module.exports = BreadcrumbSupplementalContent;
