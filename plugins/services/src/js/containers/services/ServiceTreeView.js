import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { InfoBoxInline, Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterField from "#SRC/js/components/DSLFilterField";

import Page from "#SRC/js/components/Page";
import ConfigStore from "#SRC/js/stores/ConfigStore";

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

  getNoLimitInfobox() {
    const { serviceTree } = this.props;

    // TODO: remove feature flag
    const { quota } = ConfigStore.get("config").uiConfiguration.features || {};
    const { rolesCount, groupRolesCount } = serviceTree.getRoleLength();

    if (
      !quota ||
      !serviceTree ||
      serviceTree.isRoot() ||
      !serviceTree.getEnforceRole() ||
      rolesCount === groupRolesCount
    ) {
      return null;
    }

    return (
      <InfoBoxInline
        className="quota-info"
        appearance="default"
        message={
          <React.Fragment>
            <Icon
              shape={SystemIcons.CircleInformation}
              size={iconSizeXs}
              color="currentColor"
            />
            {serviceTree.list.length === 1 ? (
              <Trans render="span">
                1 of 1 service does not have limit. Please upgrade to be
                included in quota.
              </Trans>
            ) : (
              <Trans render="span">
                {rolesCount - groupRolesCount} of {serviceTree.list.length}{" "}
                services do not have limit. Please upgrade to be included in
                quota.
              </Trans>
            )}
          </React.Fragment>
        }
      />
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

  getTabs() {
    const { quota } = ConfigStore.get("config").uiConfiguration.features || {};
    // Workaround for Cypress.
    const createModalOpen = this.context.router.routes.some(
      ({ isFullscreenModal }) => isFullscreenModal
    );

    if (!quota || createModalOpen) {
      return [];
    }
    const { serviceTree } = this.props;
    if (
      serviceTree.isRoot() ||
      typeof serviceTree.getEnforceRole() === "boolean"
    ) {
      return [
        {
          label: i18nMark("Services"),
          routePath: serviceTree.isRoot()
            ? "/services/overview"
            : `/services/overview/${encodeURIComponent(serviceTree.id)}`
        },
        {
          label: i18nMark("Quota"),
          routePath: serviceTree.isRoot()
            ? "/services/quota"
            : `/services/quota/${encodeURIComponent(serviceTree.id)}`
        }
      ];
    }
    return [];
  }

  render() {
    const {
      children,
      filterExpression,
      isEmpty,
      serviceTree,
      services
    } = this.props;

    const { modalHandlers } = this.context;
    // Only add id if service is not root
    const routePath = serviceTree.isRoot()
      ? "/services/overview/create"
      : `/services/overview/${encodeURIComponent(serviceTree.id)}/create`;
    const isRoleEnforced =
      !serviceTree.isRoot() && serviceTree.getEnforceRole();

    const createService = () => {
      this.context.router.push(routePath);
    };
    const tabs = this.getTabs();

    if (isEmpty) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
            tabs={tabs}
          />
          <EmptyServiceTree
            onCreateGroup={modalHandlers.createGroup}
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
          actions={[
            {
              onItemSelect: modalHandlers.createGroup,
              label: i18nMark("Create Group")
            }
          ]}
          addButton={{
            onItemSelect: createService,
            label: i18nMark("Run a Service")
          }}
          supplementalContent={<DeploymentStatusIndicator />}
          tabs={tabs}
        />
        <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
          {this.getFilterBar()}
          {this.getSearchHeader()}
          {this.getNoLimitInfobox()}
          <ServicesTable
            isFiltered={filterExpression.defined}
            isRoleEnforced={isRoleEnforced}
            modalHandlers={modalHandlers}
            services={services}
            hideTable={this.context.router.routes.some(
              ({ isFullscreenModal }) => isFullscreenModal
            )}
            serviceTreeId={serviceTree.id}
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
  serviceTree: PropTypes.instanceOf(ServiceTree)
};

module.exports = ServiceTreeView;
