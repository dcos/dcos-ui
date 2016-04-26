var _ = require('underscore');
var React = require('react');
import {RouteHandler} from 'react-router';

var AlertPanel = require('../components/AlertPanel');
import CompositeState from '../structs/CompositeState';
import Config from '../config/Config';
import EventTypes from '../constants/EventTypes';
import FilterBar from '../components/FilterBar';
var FilterHealth = require('../components/FilterHealth');
var FilterHeadline = require('../components/FilterHeadline');
var FilterInputText = require('../components/FilterInputText');
var Page = require('../components/Page');
var MarathonStore = require('../stores/MarathonStore');
var MesosSummaryStore = require('../stores/MesosSummaryStore');
var ResourceBarChart = require('../components/charts/ResourceBarChart');
import SaveStateMixin from '../mixins/SaveStateMixin';
var ServicesTable = require('../components/ServicesTable');
var SidebarActions = require('../events/SidebarActions');
import SidePanels from '../components/SidePanels';

function getCountByHealth(frameworks) {
  return _.foldl(frameworks, function (acc, framework) {
    let appHealth = MarathonStore.getServiceHealth(framework.name);
    if (acc[appHealth.value] === undefined) {
      acc[appHealth.value] = 1;
    } else {
      acc[appHealth.value]++;
    }
    return acc;
  }, {});
}

function getMesosServices(state) {
  let states = MesosSummaryStore.get('states');
  let lastState = states.lastSuccessful();
  let services = CompositeState.getServiceList();
  let filteredServices = services.filter({
    health: state.healthFilter,
    name: state.searchString
  }).getItems();
  let serviceIDs = _.pluck(filteredServices, 'id');

  return {
    services: filteredServices,
    totalServices: services.getItems().length,
    countByHealth: getCountByHealth(services.getItems()),
    statesProcessed: MesosSummaryStore.get('statesProcessed'),
    refreshRate: Config.getRefreshRate(),
    totalServiceResources: states.getResourceStatesForServiceIDs(serviceIDs),
    totalResources: lastState.getSlaveTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  healthFilter: null,
  searchString: ''
};

let saveState_properties = Object.keys(DEFAULT_FILTER_OPTIONS);
saveState_properties.push('selectedResource');

var ServicesPage = React.createClass({

  displayName: 'ServicesPage',

  saveState_key: 'servicesPage',

  saveState_properties,

  mixins: [SaveStateMixin],

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
  componentDidMount: function () {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );

    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );
  },

  componentWillUnmount: function () {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );

    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_REQUEST_ERROR,
      this.onMesosStateChange
    );
  },

  onMesosStateChange: function () {
    this.forceUpdate();
  },

  handleHealthFilterChange: function (healthFilter) {
    var stateChanges = _.clone(DEFAULT_FILTER_OPTIONS);
    stateChanges.healthFilter = healthFilter;
    this.setState(stateChanges);
  },

  onResourceSelectionChange: function (selectedResource) {
    if (this.state.selectedResource !== selectedResource) {
      this.setState({selectedResource: selectedResource});
    }
  },

  handleSearchStringChange: function (searchString) {
    this.setState({searchString: searchString});
  },

  resetFilter: function () {
    var state = _.clone(DEFAULT_FILTER_OPTIONS);
    this.setState(state);
  },

  getServicesPageContent: function (data) {
    let state = this.state;
    let appsProcessed = MarathonStore.hasProcessedApps();

    return (
      <div>
        <ResourceBarChart
          itemCount={data.services.length}
          resources={data.totalServiceResources}
          totalResources={data.totalResources}
          refreshRate={data.refreshRate}
          resourceType="Services"
          selectedResource={state.selectedResource}
          onResourceSelectionChange={this.onResourceSelectionChange} />
        <FilterHeadline
          inverseStyle={true}
          onReset={this.resetFilter}
          name="Services"
          currentLength={data.services.length}
          totalLength={data.totalServices} />
        <FilterBar>
          <FilterHealth
            countByHealth={data.countByHealth}
            healthFilter={state.healthFilter}
            handleFilterChange={this.handleHealthFilterChange}
            servicesLength={data.totalServices} />
          <div className="form-group flush-bottom">
            <FilterInputText
              className="flush-bottom"
              searchString={state.searchString}
              handleFilterChange={this.handleSearchStringChange}
              inverseStyle={true} />
          </div>
        </FilterBar>
        <ServicesTable
          services={data.services}
          healthProcessed={appsProcessed} />
        <SidePanels
          params={this.props.params}
          openedPage="services" />
      </div>
    );
  },

  getEmptyServicesPageContent: function () {
    return (
      <AlertPanel
        title="No Services Installed"
        iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush-bottom">
          Use the {Config.productName} command line tools to find and install services.
        </p>
      </AlertPanel>
    );
  },

  getContents: function (isEmpty, data) {
    if (isEmpty) {
      return this.getEmptyServicesPageContent();
    } else {
      return this.getServicesPageContent(data);
    }
  },

  render: function () {
    var data = getMesosServices(this.state);
    var isEmpty = data.statesProcessed && data.totalServices === 0;

    return (
      <Page title="Services">
        {this.getContents(isEmpty, data)}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
