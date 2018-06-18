import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";

import Icon from "#SRC/js/components/Icon";

import PageHeaderActions from "./PageHeaderActions";
import PageHeaderBreadcrumbs from "./PageHeaderBreadcrumbs";
import PageHeaderTabs from "./PageHeaderTabs";
import SidebarToggle from "./SidebarToggle";

class PageHeader extends React.Component {
  render() {
    const {
      props: {
        actions,
        addButton,
        breadcrumbs,
        pageHeaderClassName,
        pageHeaderInnerClassName,
        pageHeaderSectionPrimaryClassName,
        secondaryContentDetail,
        pageHeaderSectionSecondaryClassName,
        supplementalContent,
        tabs,
        disabledActions,
        pageHeaderContentClassName,
        pageHeaderActionsPrimaryClassName
      }
    } = this;

    const pageHeaderClasses = classNames("page-header", pageHeaderClassName);
    const pageHeaderInnerClasses = classNames(
      "page-header-inner pod",
      pageHeaderInnerClassName
    );
    const pageHeaderSectionPrimaryClasses = classNames(
      "page-header-section page-header-section-primary",
      pageHeaderSectionPrimaryClassName
    );
    const pageHeaderSectionSecondaryClasses = classNames(
      "page-header-section page-header-section-secondary",
      pageHeaderSectionSecondaryClassName
    );
    const pageHeaderContentClasses = classNames(
      "page-header-content",
      pageHeaderContentClassName
    );
    const pageHeaderActionsPrimaryClasses = classNames(
      "page-header-actions page-header-action-primary flex",
      pageHeaderActionsPrimaryClassName
    );
    let secondaryContentDetailElement = null;

    if (secondaryContentDetail) {
      secondaryContentDetailElement = (
        <div className="page-header-content-section-secondary-detail">
          {secondaryContentDetail}
        </div>
      );
    }

    const editIcon = <Icon id="pencil" size="mini" />;

    const editButton = actions
      .filter(action => action.label === "Edit")
      .map(action => {
        return (
          <a
            key={action.label}
            className="button button-primary"
            onClick={action.onItemSelect}
          >
            {editIcon}
            <span>{action.label}</span>
          </a>
        );
      });

    return (
      <div className={pageHeaderClasses}>
        <div className={pageHeaderInnerClasses}>
          <div className={pageHeaderSectionPrimaryClasses}>
            <SidebarToggle />
            <div className={pageHeaderContentClasses}>{breadcrumbs}</div>
            <div className={pageHeaderActionsPrimaryClasses}>
              {editButton}
              <PageHeaderActions
                actions={actions}
                addButton={addButton}
                supplementalContent={supplementalContent}
                disabledActions={disabledActions}
              />
            </div>
          </div>
          <div className={pageHeaderSectionSecondaryClasses}>
            <PageHeaderTabs tabs={tabs} />
            {secondaryContentDetailElement}
          </div>
        </div>
      </div>
    );
  }
}

const classProps = PropTypes.oneOfType([
  PropTypes.array,
  PropTypes.object,
  PropTypes.string
]);

PageHeader.defaultProps = {
  actions: [],
  tabs: [],
  disabledActions: false
};

PageHeader.propTypes = {
  addButton: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  actions: PropTypes.array,
  breadcrumbs: PropTypes.node,
  pageHeaderClassName: classProps,
  pageHeaderInnerClassName: classProps,
  pageHeaderSectionPrimaryClassName: classProps,
  pageHeaderSectionSecondaryClassName: classProps,
  secondaryContentDetail: PropTypes.node,
  supplementalContent: PropTypes.node,
  tabs: PropTypes.array,
  disabledActions: PropTypes.bool,
  pageHeaderContentClassName: classProps,
  pageHeaderActionsPrimaryClassNam: classProps
};

PageHeader.Breadcrumbs = PageHeaderBreadcrumbs;
PageHeader.Actions = PageHeaderActions;
PageHeader.Tabs = PageHeaderTabs;

module.exports = PageHeader;
