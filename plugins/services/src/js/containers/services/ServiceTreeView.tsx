import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";

import {
  DropdownMenu,
  DropdownSection,
  DropdownMenuItem,
  PrimaryDropdownButton
} from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

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
  static defaultProps = {
    onFilterExpressionChange() {},
    isEmpty: false
  };
  static propTypes = {
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
    const hasQuota = serviceTreeHasQuota(serviceTree, roles);

    const routePath = isRoot
      ? "/services/overview/create"
      : `/services/overview/${encodeURIComponent(serviceTree.id)}/create`;

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

    const onAddSelect = selectedItem => {
      switch (selectedItem) {
        case "runService":
          createService();
          break;
        case "createGroup":
          createGroup();
          break;
        default:
          break;
      }
    };

    const onEditSelect = () => {
      this.context.router.push(
        `/services/detail/${encodeURIComponent(serviceTree.getId())}/edit/`
      );
    };

    const actionMenu = (
      <React.Fragment>
        <DropdownMenu
          trigger={
            <PrimaryDropdownButton
              className="button-transparent"
              iconStart={SystemIcons.Plus}
            >
              <Trans render="span">New</Trans>
            </PrimaryDropdownButton>
          }
          onSelect={onAddSelect}
        >
          <DropdownSection>
            <DropdownMenuItem key="runService" value="runService">
              <Trans render="span">Run a Service</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem key="createGroup" value="createGroup">
              <Trans render="span">Create Group</Trans>
            </DropdownMenuItem>
          </DropdownSection>
        </DropdownMenu>
      </React.Fragment>
    );
    const tabs = this.getTabs(hasQuota);
    const editGroupActions = [
      {
        onItemSelect: onEditSelect,
        label: i18nMark("Edit Group")
      }
    ];

    if (isEmpty) {
      // We don't want an empty "+" dropdown.
      const pageHeader = serviceTree.isTopLevel() ? (
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          supplementalContent={
            <React.Fragment>
              <DeploymentStatusIndicator />
            </React.Fragment>
          }
          actions={editGroupActions}
          tabs={tabs}
        />
      ) : (
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          supplementalContent={<DeploymentStatusIndicator />}
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
          supplementalContent={
            <React.Fragment>
              <DeploymentStatusIndicator />
              {actionMenu}
            </React.Fragment>
          }
          tabs={tabs}
          actions={serviceTree.isTopLevel() ? editGroupActions : []}
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

export default ServiceTreeView;
