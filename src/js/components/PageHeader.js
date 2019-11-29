import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import PageHeaderActions from "./PageHeaderActions";
import PageHeaderBreadcrumbs from "./PageHeaderBreadcrumbs";
import PageHeaderTabs from "./PageHeaderTabs";

const PageHeader = props => {
  const {
    actions,
    addButton,
    breadcrumbs,
    supplementalContent,
    tabs,
    actionsDisabled
  } = props;

  const editButton = actions
    .filter(action => action.label === "Edit")
    .map(action => (
      <a
        key={action.label}
        className="button button-primary"
        onClick={action.onItemSelect}
      >
        <Icon
          shape={SystemIcons.Pencil}
          size={iconSizeXs}
          color="currentColor"
        />
        <Trans render="span" id={action.label} />
      </a>
    ));

  return (
    <div className="page-header">
      <div className="page-header-inner pod">
        <div className="page-header-section page-header-section-primary">
          <div className="page-header-content">{breadcrumbs}</div>
          <div className="page-header-actions page-header-action-primary flex">
            {editButton}
            <PageHeaderActions
              actions={actions}
              addButton={addButton}
              supplementalContent={supplementalContent}
              actionsDisabled={actionsDisabled}
            />
          </div>
        </div>
        <div className="page-header-section page-header-section-secondary">
          <PageHeaderTabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

PageHeader.defaultProps = {
  actions: [],
  tabs: [],
  actionsDisabled: false
};

PageHeader.propTypes = {
  addButton: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  actions: PropTypes.array,
  breadcrumbs: PropTypes.node.isRequired,
  supplementalContent: PropTypes.node,
  tabs: PropTypes.array,
  actionsDisabled: PropTypes.bool
};

PageHeader.Breadcrumbs = PageHeaderBreadcrumbs;
PageHeader.Actions = PageHeaderActions;
PageHeader.Tabs = PageHeaderTabs;

export default PageHeader;
