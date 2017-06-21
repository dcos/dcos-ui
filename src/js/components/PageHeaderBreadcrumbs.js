import classNames from "classnames";
import { Link } from "react-router";
import React from "react";
import { Tooltip } from "reactjs-components";

import Breadcrumb from "./Breadcrumb";
import BreadcrumbCaret from "./BreadcrumbCaret";
import Icon from "./Icon";

class PageHeaderBreadcrumbs extends React.Component {
  getCaret(key) {
    return <BreadcrumbCaret key={`caret-${key}`} />;
  }

  render() {
    const { props: { breadcrumbs, iconID, iconRoute } } = this;
    const breadcrumbCount = breadcrumbs.length;
    const sectionIcon = (
      <Breadcrumb key={-1} isIcon={true} title="Section Icon">
        <Link to={iconRoute}>
          <Icon family="product" id={iconID} size="small" />
        </Link>
      </Breadcrumb>
    );
    const shouldTruncateBreadcrumbs = breadcrumbCount > 3;

    const breadcrumbElements = breadcrumbs.reduce(
      (memo, breadcrumb, index) => {
        if (index === 0) {
          memo.push(this.getCaret("first-caret"));
        }

        if (shouldTruncateBreadcrumbs && index === breadcrumbCount - 3) {
          memo.push(
            <Tooltip
              content={breadcrumb.props.title}
              key="breadcrumb-ellipsis"
              wrapperClassName="breadcrumb breadcrumb--force-ellipsis"
            >
              {breadcrumb}
            </Tooltip>,
            this.getCaret(index)
          );
        }

        if (shouldTruncateBreadcrumbs && index < breadcrumbCount - 2) {
          return memo;
        }

        memo.push(React.cloneElement(breadcrumb, { key: index }));

        if (index !== breadcrumbs.length - 1) {
          memo.push(this.getCaret(index));
        }

        return memo;
      },
      [sectionIcon]
    );

    const breadcrumbClasses = classNames("breadcrumbs", {
      "breadcrumbs--is-truncated": shouldTruncateBreadcrumbs
    });

    return (
      <div className={breadcrumbClasses}>
        {breadcrumbElements}
      </div>
    );
  }
}

PageHeaderBreadcrumbs.propTypes = {
  iconID: React.PropTypes.string.isRequired,
  breadcrumbs: React.PropTypes.arrayOf(React.PropTypes.node).isRequired
};

module.exports = PageHeaderBreadcrumbs;
