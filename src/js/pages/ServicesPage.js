import _ from 'underscore';
import React from 'react';
import {RouteHandler} from 'react-router';

import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../components/AlertPanel';
import CompositeState from '../structs/CompositeState';
import Config from '../config/Config';
import DCOSStore from '../stores/DCOSStore';
import FilterHeadline from '../components/FilterHeadline';
import FilterInputText from '../components/FilterInputText';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Page from '../components/Page';
import Service from '../structs/Service';
import ServiceDetail from '../components/ServiceDetail';
import MarathonStore from '../stores/MarathonStore';
import ServiceSiderbarFilter from '../components/ServiceSiderbarFilter';
import ServicesTable from '../components/ServicesTable';
import ServiceTree from '../structs/ServiceTree';
import SidebarActions from '../events/SidebarActions';
import SidePanels from '../components/SidePanels';

var DEFAULT_FILTER_OPTIONS = {
  healthFilter: null,
  searchString: ''
};

var ServicesPage = React.createClass({

  displayName: 'ServicesPage',

  mixins: [InternalStorageMixin, StoreMixin],

  statics: {
    routeConfig: {
      label: 'Services',
      icon: 'services',
      matches: /^\/services/
    },

    // Static life cycle method from react router, that will be called
    // 'when a handler is about to render', i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return _.extend({selectedResource: 'cpus'}, DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount: function () {
    this.internalStorage_update({
      openServicePanel: false,
      openTaskPanel: false
    });

    this.store_listeners = [{name: 'dcos', events: ['change']}];
  },

  componentDidMount: function () {
    this.internalStorage_update({
      openServicePanel: this.props.params.serviceName != null,
      openTaskPanel: this.props.params.taskID != null
    });
  },

  componentWillReceiveProps: function (nextProps) {
    this.internalStorage_update({
      openServicePanel: nextProps.params.serviceName != null,
      openTaskPanel: nextProps.params.taskID != null
    });
  },

  getServices: function (serviceTreeId) {
    let serviceTree = DCOSStore.serviceTree.findItem(function (item) {
      return item instanceof ServiceTree && item.getId() === serviceTreeId;
    });

    if (serviceTree) {
      return serviceTree.getItems();
    }

    return DCOSStore.serviceTree.getItems();
  },

  getServicesPageContent: function () {
    let serviceTreeId =
      decodeURIComponent(this.context.router.getCurrentParams().serviceTreeId);

    let state = this.state;
    let serviceTree = this.getServiceTree(serviceTreeId);

    let services = serviceTree.getItems();
    let filteredServices = serviceTree.filterItemsByFilter({
      health: state.filterHealth,
      name: state.searchString
    }).getItems();

    return (
      <div className="flex-box flush flex-mobile-column">
        <ServiceSidebarFilters
          handleFilterChange={this.handleFilterChange}
          services={services} />
        <div className="flex-grow">
          <FilterHeadline
            inverseStyle={true}
            onReset={this.resetFilter}
            name="Services"
            currentLength={filteredServices.length}
            totalLength={services.length} />
          <ServicesTable
            services={filteredServices} />
        </div>
        <SidePanels
          params={this.props.params}
          openedPage="services"/>
      </div>
    );
  },

  getEmptyServicesPageContent: function () {
    return (
      <AlertPanel
        title="No Services Installed"
        iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush">
          Use the DCOS command line tools to find and install services.
        </p>
      </AlertPanel>
    );
  },

  getContents: function (isEmpty) {
    if (isEmpty) {
      return this.getEmptyServicesPageContent();
    } else {
      return this.getServicesPageContent();
    }
  },

  render: function () {
    let {id} = this.props.params;

    return (
      <Page title="Services">
        {this.getContents(decodeURIComponent(id))}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
