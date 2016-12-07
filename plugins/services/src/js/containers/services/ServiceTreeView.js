import classNames from 'classnames';
import React, {PropTypes} from 'react';

import EmptyServiceTree from './EmptyServiceTree';
import Service from '../../structs/Service';
import ServicesTable from './ServicesTable';

import DSLFilterList from '../../../../../../src/js/structs/DSLFilterList';
import DSLFilterField from '../../../../../../src/js/components/DSLFilterField';

class ServiceTreeView extends React.Component {
  getButtonBar() {
    const {modalHandlers} = this.context;
    const {filterExpression} = this.props;

    if (filterExpression.defined) {
      return null;
    }

    return (
      <div className="column-medium-7 text-align-right">
        <button className="button button-stroke"
          onClick={modalHandlers.createGroup}>
          Create Group
        </button>
        {' '}
        <button className="button button-success"
          onClick={modalHandlers.createService}>
          Run a Service
        </button>
      </div>
    );
  }

  getFilterBar() {
    const {
      filters,
      filterExpression,
      onFilterExpressionChange
    } = this.props;

    let hostClasses = classNames({
      'column-medium-5': !filterExpression.value,
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
        {this.getButtonBar()}
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
  }

  render() {
    const {
      filterExpression,
      isEmpty,
      services
    } = this.props;

    const {modalHandlers} = this.context;

    if (isEmpty) {
      return (
        <EmptyServiceTree
          onCreateGroup={modalHandlers.createGroup}
          onCreateService={modalHandlers.createService} />
      );
    }

    return (
      <div>
        {this.getFilterBar()}
        {this.getSearchHeader()}
        <ServicesTable services={services}
          isFiltered={filterExpression.defined}
          modalHandlers={modalHandlers} />
      </div>
    );
  }
}

ServiceTreeView.contextTypes = {
  modalHandlers: PropTypes.shape({
    creatGroup: PropTypes.func,
    createService: PropTypes.func
  }).isRequired
};

ServiceTreeView.defaultProps = {
  onFilterExpressionChange() {},
  isEmpty: false
};

ServiceTreeView.propTypes = {
  onFilterExpressionChange: PropTypes.func,
  services: PropTypes.arrayOf(PropTypes.instanceOf(Service)).isRequired,
  filters: PropTypes.instanceOf(DSLFilterList).isRequired,
  filterExpression: PropTypes.string.isRequired,
  isEmpty: PropTypes.bool
};

module.exports = ServiceTreeView;
