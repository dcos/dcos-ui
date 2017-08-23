/* @flow */
import classNames from "classnames/dedupe";
import React from "react";

import PageHeaderActions from "./PageHeaderActions";
import PageHeaderBreadcrumbs from "./PageHeaderBreadcrumbs";
import PageHeaderTabs from "./PageHeaderTabs";
import SidebarToggle from "./SidebarToggle";

type Props = {
  addButton?: Array<Object> | Object,
  actions?: Array<any>,
  breadcrumbs: number | string | React.Element | Array<any>,
  className?: classProps,
  innerClassName?: classProps,
  primaryContentClassName?: classProps,
  secondaryContentClassName?: classProps,
  secondaryContentDetail?: number | string | React.Element | Array<any>,
  supplementalContent?: number | string | React.Element | Array<any>,
  tabs?: Array<any>
};

class PageHeader extends React.Component {

  render() {
    const {
      props: {
        actions,
        addButton,
        breadcrumbs,
        className,
        innerClassName,
        primaryContentClassName,
        secondaryContentDetail,
        secondaryContentClassName,
        supplementalContent,
        tabs
      }
    } = this;

    const classes = classNames("page-header", className);
    const innerClasses = classNames("page-header-inner pod", innerClassName);
    const primaryContentClasses = classNames(
      "page-header-content-section page-header-content-section-primary",
      primaryContentClassName
    );
    const secondaryContentClasses = classNames(
      "page-header-content-section page-header-content-section-secondary",
      secondaryContentClassName
    );
    let secondaryContentDetailElement = null;

    if (secondaryContentDetail) {
      secondaryContentDetailElement = (
        <div className="page-header-content-section-secondary-detail">
          {secondaryContentDetail}
        </div>
      );
    }

    return (
      <div className={classes}>
        <div className={innerClasses}>
          <div className={primaryContentClasses}>
            <SidebarToggle />
            {breadcrumbs}
            <PageHeaderActions
              actions={actions}
              addButton={addButton}
              supplementalContent={supplementalContent}
            />
          </div>
          <div className={secondaryContentClasses}>
            <PageHeaderTabs tabs={tabs} />
            {secondaryContentDetailElement}
          </div>
        </div>
      </div>
    );
  }
}

const classProps = React.PropTypes.oneOfType([
  React.PropTypes.array,
  React.PropTypes.object,
  React.PropTypes.string
]);

PageHeader.defaultProps = {
  actions: [],
  tabs: []
};

PageHeader.Breadcrumbs = PageHeaderBreadcrumbs;
PageHeader.Actions = PageHeaderActions;
PageHeader.Tabs = PageHeaderTabs;

module.exports = PageHeader;
