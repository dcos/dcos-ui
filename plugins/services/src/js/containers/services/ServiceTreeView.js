import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterField from "#SRC/js/components/DSLFilterField";

import Page from "#SRC/js/components/Page";

import DeploymentStatusIndicator from "../../components/DeploymentStatusIndicator";
import EmptyServiceTree from "./EmptyServiceTree";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";
import Service from "../../structs/Service";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceHealthDSLSection from "../../components/dsl/ServiceHealthDSLSection";
import ServiceOtherDSLSection from "../../components/dsl/ServiceOtherDSLSection";
import ServicesTable from "./ServicesTable";
import ServiceStatusDSLSection from "../../components/dsl/ServiceStatusDSLSection";
import ServiceTree from "../../structs/ServiceTree";
import { serviceTreeHasQuota } from "../../utils/QuotaUtil";

const DSL_FORM_SECTIONS = [
  ServiceStatusDSLSection,
  ServiceHealthDSLSection,
  ServiceOtherDSLSection,
  FuzzyTextDSLSection
];

class ServiceTreeView extends React.Component {
  getFilterBar() {
    const { filters, filterExpression, onFilterExpressionChange } = this.props;

    const hostClasses = classNames({
      "column-medium-5": !filterExpression.value,
      "column-medium-12": filterExpression.value
    });

    return (
      <div className="row">
        <div className={hostClasses}>
          <DSLFilterField
            filters={filters}
            formSections={DSL_FORM_SECTIONS}
            expression={filterExpression}
            onChange={onFilterExpressionChange}
          />
        </div>
      </div>
    );
  }

  getSearchHeader() {
    const { filterExpression } = this.props;
    if (filterExpression.defined) {
      return (
        <Trans render="h5" className="muted">
          Search Results
        </Trans>
      );
    }

    return null;
  }

  getTabs(hasQuota) {
    // Workaround for Cypress.
    const createModalOpen = this.context.router.routes.some(
      ({ isFullscreenModal }) => isFullscreenModal
    );

    if (createModalOpen) {
      return [];
    }
    const { serviceTree } = this.props;
    const id = serviceTree.getId();
    if (serviceTree.isRoot() || hasQuota) {
      return [
        {
          label: i18nMark("Services"),
          routePath: serviceTree.isRoot()
            ? "/services/overview"
            : `/services/overview/${encodeURIComponent(id)}`
        },
        {
          label: i18nMark("Quota"),
          routePath: serviceTree.isRoot()
            ? "/services/quota"
            : `/services/quota/${encodeURIComponent(id)}`
        }
      ];
    }
    return [];
  }

  editGroup() {
    const { router } = this.context;
    const { serviceTree } = this.props;

    router.push(
      `/services/detail/${encodeURIComponent(serviceTree.getId())}/edit/`
    );
  }

  render() {
    const {
      children,
      filterExpression,
      isEmpty,
      serviceTree,
      services,
      roles
    } = this.props;

    const { modalHandlers } = this.context;
    // Only add id if service is not root
    const isRoot = serviceTree.isRoot();
    const routePath = isRoot
      ? "/services/overview/create"
      : `/services/overview/${encodeURIComponent(serviceTree.id)}/create`;
    const hasQuota = serviceTreeHasQuota(serviceTree, roles);

    const createService = () => {
      this.context.router.push(routePath);
    };
    let createGroup;
    if (isRoot) {
      createGroup = () => {
        this.context.router.push("/services/overview/create_group");
      };
    } else {
      createGroup = modalHandlers.createGroup;
    }
    const tabs = this.getTabs(hasQuota);
    const editGroup = this.editGroup.bind(this);
    const editGroupAction = {
      onItemSelect: editGroup,
      label: i18nMark("Edit Group")
    };

    if (isEmpty) {
      // We don't want an empty "+" dropdown.
      const pageHeader = serviceTree.isTopLevel() ? (
        <Page.Header
          addButton={editGroupAction}
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          tabs={tabs}
        />
      ) : (
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          tabs={tabs}
        />
      );
      return (
        <Page>
          {pageHeader}
          <EmptyServiceTree
            onCreateGroup={createGroup}
            onCreateService={createService}
          />
          {children}
        </Page>
      );
    }

    return (
      <Page dontScroll={true} flushBottom={true}>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          addButton={[
            {
              onItemSelect: createService,
              label: i18nMark("Run a Service")
            },
            {
              onItemSelect: createGroup,
              label: i18nMark("Create Group")
            },
            ...(serviceTree.isTopLevel() ? [editGroupAction] : [])
          ]}
          supplementalContent={<DeploymentStatusIndicator />}
          tabs={tabs}
        />
        <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
          {this.getFilterBar()}
          {this.getSearchHeader()}
          <ServicesTable
            isFiltered={filterExpression.defined}
            modalHandlers={modalHandlers}
            services={services}
            hideTable={this.context.router.routes.some(
              ({ isFullscreenModal }) => isFullscreenModal
            )}
          />
        </div>
        {children}
      </Page>
    );
  }
}

ServiceTreeView.contextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func
  }).isRequired,
  router: routerShape
};

ServiceTreeView.defaultProps = {
  onFilterExpressionChange() {},
  isEmpty: false
};

ServiceTreeView.propTypes = {
  filters: PropTypes.instanceOf(Array).isRequired,
  filterExpression: PropTypes.instanceOf(DSLExpression).isRequired,
  isEmpty: PropTypes.bool,
  children: PropTypes.node,
  onFilterExpressionChange: PropTypes.func,
  services: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.instanceOf(Service),
      PropTypes.instanceOf(ServiceTree)
    ])
  ).isRequired,
  serviceTree: PropTypes.instanceOf(ServiceTree),
  roles: PropTypes.array
};

module.exports = ServiceTreeView;
