import classNames from "classnames";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import EmptyServiceTree from "./EmptyServiceTree";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServicesTable from "./ServicesTable";

import Page from "../../../../../../src/js/components/Page";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";

import DSLFilterList from "../../../../../../src/js/structs/DSLFilterList";
import DSLFilterField from "../../../../../../src/js/components/DSLFilterField";
import DSLExpression from "../../../../../../src/js/structs/DSLExpression";

import ServiceHealthDSLSection
  from "../../components/dsl/ServiceHealthDSLSection";
import ServiceOtherDSLSection
  from "../../components/dsl/ServiceOtherDSLSection";
import ServiceStatusDSLSection
  from "../../components/dsl/ServiceStatusDSLSection";
import FuzzyTextDSLSection from "../../components/dsl/FuzzyTextDSLSection";

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
            formSections={[
              ServiceStatusDSLSection,
              ServiceHealthDSLSection,
              ServiceOtherDSLSection,
              FuzzyTextDSLSection
            ]}
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
      return <h5 className="muted">Search Results</h5>;
    }

    return null;
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
    const createService = () => {
      this.context.router.push(
        `/services/overview/${encodeURIComponent(serviceTree.id)}/create`
      );
    };

    if (isEmpty) {
      return (
        <Page>
          <Page.Header
            breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
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
      <Page>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          actions={[
            { onItemSelect: modalHandlers.createGroup, label: "Create Group" }
          ]}
          addButton={{ onItemSelect: createService, label: "Run a Service" }}
        />
        <div>
          {this.getFilterBar()}
          {this.getSearchHeader()}
          <ServicesTable
            isFiltered={filterExpression.defined}
            modalHandlers={modalHandlers}
            services={services}
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
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
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
