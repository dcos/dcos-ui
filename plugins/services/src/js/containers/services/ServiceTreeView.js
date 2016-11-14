import React, {PropTypes} from 'react';

import EmptyServiceTree from './EmptyServiceTree';
import ServiceSearchFilter from './ServiceSearchFilter';
import ServiceSidebarFilters from './ServiceSidebarFilters';
import ServiceTree from '../../structs/ServiceTree';
import ServicesTable from './ServicesTable';

import Breadcrumbs from '../../../../../../src/js/components/Breadcrumbs';
import FilterBar from '../../../../../../src/js/components/FilterBar';
import FilterHeadline from '../../../../../../src/js/components/FilterHeadline';

class ServiceTreeView extends React.Component {

  getHeadline() {
    const {services} = this.props;

    if (services.filters.searchString) {
      return (
        <ul className="breadcrumb-style-headline list-unstyled list-inline">
          <li className="h4">
            Showing results for "{services.filters.searchString}"
          </li>
          <li className="h4 clickable" onClick={this.props.clearFilters}>
            <a className="small">
              (Clear)
            </a>
          </li>
        </ul>
      );
    }

    if (Object.keys(services.filters).length) {
      return (
        <FilterHeadline
          className="breadcrumb-style-headline"
          onReset={this.props.clearFilters}
          name="Service"
          currentLength={services.filtered.length}
          totalLength={services.all.length} />
      );
    }

    return (
      <Breadcrumbs routes={this.props.routes} params={this.props.params} />
    );
  }

  render() {
    const {
      serviceTree,
      services
    } = this.props;

    const {modalHandlers} = this.context;

    if (serviceTree.getItems().length) {
      return (
        <div className="flex">
          <ServiceSidebarFilters
            countByValue={services.countByFilter}
            filters={services.filters}
            handleFilterChange={this.props.handleFilterChange}
            services={services.all} />
          <div className="flex-grow">
            {this.getHeadline()}
            <FilterBar rightAlignLastNChildren={2}>
              <ServiceSearchFilter
                handleFilterChange={this.props.handleFilterChange}
                filters={services.filters || {}} />
              <button className="button button-stroke"
                onClick={modalHandlers.createGroup}>
                Create Group
              </button>
              <button className="button button-success"
                onClick={modalHandlers.createService}>
                Deploy Service
              </button>
            </FilterBar>
            <ServicesTable services={services.filtered}
              isFiltered={!!Object.keys(services.filters).length}
              modalHandlers={modalHandlers} />
          </div>
        </div>
      );
    };

    return (
      <EmptyServiceTree
        onCreateGroup={modalHandlers.createGroup}
        onCreateService={modalHandlers.createService} />
    );
  }
}

ServiceTreeView.contextTypes = {
  modalHandlers: PropTypes.shape({
    creatGroup: PropTypes.func,
    createService: PropTypes.func
  }).isRequired
};

const servicesProps = PropTypes.shape({
  all: PropTypes.array,
  countByFilter: PropTypes.object,
  filters: PropTypes.object,
  filtered: PropTypes.array
}).isRequired;

ServiceTreeView.propTypes = {
  clearFilters: PropTypes.func.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  serviceTree: PropTypes.instanceOf(ServiceTree),
  services: servicesProps
};

module.exports = ServiceTreeView;
