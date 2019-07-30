import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";
import { Trans, Plural } from "@lingui/macro";
import { InfoBoxInline, Icon, SpacingBox } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DSLExpression from "#SRC/js/structs/DSLExpression";
import DSLFilterField from "#SRC/js/components/DSLFilterField";
import ConfigStore from "#SRC/js/stores/ConfigStore";

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

function quotaFeatureEnabled() {
  const { quota } = ConfigStore.get("config").uiConfiguration.features || {};
  return quota === true;
}

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

  getNoLimitInfobox(hasQuota) {
    if (!hasQuota) {
      return null;
    }
    const { serviceTree } = this.props;

    const { servicesCount, groupRolesCount } = serviceTree.getRoleLength();
    const nonLimited = servicesCount - groupRolesCount;

    if (!nonLimited) {
      return null;
    }

    return (
      <SpacingBox side="bottom" spacingSize="l">
        <InfoBoxInline
          appearance="default"
          message={
            <React.Fragment>
              <Icon
                shape={SystemIcons.CircleInformation}
                size={iconSizeXs}
                color="currentColor"
              />
              <Plural
                render={<span id="quota-no-limit-infobox" />}
                value={nonLimited}
                one={`# service is not limited by quota. Update role to have quota enforced.`}
                other={`# services are not limited by quota. Update role to have quota enforced.`}
              />
            </React.Fragment>
          }
        />
      </SpacingBox>
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
    if (isRoot && quotaFeatureEnabled()) {
      createGroup = () => {
        this.context.router.push("/services/overview/create_group");
      };
    } else {
      createGroup = modalHandlers.createGroup;
    }
    const tabs = this.getTabs(hasQuota);

    if (isEmpty) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
            tabs={tabs}
          />
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
            }
          ]}
          supplementalContent={<DeploymentStatusIndicator />}
          tabs={tabs}
        />
        <div className="flex-item-grow-1 flex flex-direction-top-to-bottom">
          {this.getFilterBar()}
          {this.getSearchHeader()}
          {this.getNoLimitInfobox(hasQuota)}
          <ServicesTable
            isFiltered={filterExpression.defined}
            hasQuota={hasQuota}
            modalHandlers={modalHandlers}
            services={services}
            hideTable={this.context.router.routes.some(
              ({ isFullscreenModal }) => isFullscreenModal
            )}
            isRoot={isRoot}
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
