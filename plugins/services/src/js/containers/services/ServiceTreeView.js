import classNames from 'classnames';
import React, {PropTypes} from 'react';

import EmptyServiceTree from './EmptyServiceTree';
import ServiceBreadcrumbs from '../../components/ServiceBreadcrumbs';
import ServicesTable from './ServicesTable';

import Page from '../../../../../../src/js/components/Page';
import Service from '../../structs/Service';

import DSLFilterList from '../../../../../../src/js/structs/DSLFilterList';
import DSLFilterField from '../../../../../../src/js/components/DSLFilterField';

class ServiceTreeView extends React.Component {
  getFilterBar() {
    const {
      filters,
      filterExpression,
      onFilterExpressionChange
    } = this.props;

    let hostClasses = classNames({
      'column-medium-4': !filterExpression.value,
      'column-medium-12': filterExpression.value
    });

    return (
      <div className="row">
        <div className={hostClasses}>
          <DSLFilterField
            filters={filters}
            expression={filterExpression}
            onChange={onFilterExpressionChange} />
        </div>
      </div>
    );
  }

  getSearchHeader() {
    let {filterExpression} = this.props;
    if (filterExpression.defined) {
      return (
        <h5 className="muted">Search Results</h5>
      );
    }

    return null;
  }

  render() {
    const {
      modals,
      filterExpression,
      isEmpty,
      serviceTree,
      services
    } = this.props;

    const {modalHandlers} = this.context;

    if (isEmpty) {
      return (
        <Page>
          <Page.Header breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />} />
          <EmptyServiceTree
            onCreateGroup={modalHandlers.createGroup}
            onCreateService={modalHandlers.createService} />
          {modals}
        </Page>
      );
    }

    return (
      <Page>
        <Page.Header
          breadcrumbs={<ServiceBreadcrumbs serviceID={serviceTree.id} />}
          actions={[{onItemSelect: modalHandlers.createGroup, label: 'Create Group'}]}
          addButton={{onItemSelect: modalHandlers.createService, label: 'Run a Service'}}
          />
        <div>
          {this.getFilterBar()}
          {this.getSearchHeader()}
          <ServicesTable services={services}
            isFiltered={filterExpression.defined}
            modalHandlers={modalHandlers} />
        </div>
        {modals}
      </Page>
    );
  }
}

ServiceTreeView.contextTypes = {
  modalHandlers: PropTypes.shape({
    createGroup: PropTypes.func,
    createService: PropTypes.func
  }).isRequired
};

ServiceTreeView.defaultProps = {
  onFilterExpressionChange() {},
  isEmpty: false
};

ServiceTreeView.propTypes = {
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
  filterExpression: PropTypes.string.isRequired,
  isEmpty: PropTypes.bool,
  modals: PropTypes.node,
  onFilterExpressionChange: PropTypes.func,
  services: PropTypes.arrayOf(PropTypes.instanceOf(Service)).isRequired
};

module.exports = ServiceTreeView;
