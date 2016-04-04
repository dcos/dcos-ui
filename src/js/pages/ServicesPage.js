var _ = require('underscore');
var React = require('react');
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

var AlertPanel = require('../components/AlertPanel');
import Config from '../config/Config';
import DCOSStore from '../stores/DCOSStore';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
import Page from '../components/Page';
var ServicesTable = require('../components/ServicesTable');
var ServiceTree = require('../structs/ServiceTree');
var SidebarActions = require('../events/SidebarActions');
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

    return (
      <div>
        <ServicesTable
          services={this.getServices(serviceTreeId)}/>
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
        <p className="flush-bottom">
          Use the {Config.productName} command line tools to find and install services.
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
    let data = this.internalStorage_get();
    let isEmpty = DCOSStore.statesProcessed && data.totalServices === 0;

    return (
      <Page title="Services">
        {this.getContents(isEmpty)}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
