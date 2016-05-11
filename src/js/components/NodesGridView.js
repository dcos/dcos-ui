var classNames = require('classnames');
import deepEqual from 'deep-equal';
var React = require('react');

import EventTypes from '../constants/EventTypes';
var InternalStorageMixin = require('../mixins/InternalStorageMixin');
var MesosStateStore = require('../stores/MesosStateStore');
var NodesGridDials = require('./NodesGridDials');
var RequestErrorMsg = require('./RequestErrorMsg');
var MAX_SERVICES_TO_SHOW = 8;
var OTHER_SERVICES_COLOR = 8;

var NodesGridView = React.createClass({

  displayName: 'NodesGridView',

  propTypes: {
    hosts: React.PropTypes.array.isRequired,
    selectedResource: React.PropTypes.string.isRequired,
    services: React.PropTypes.array.isRequired
  },

  mixins: [InternalStorageMixin],

  getInitialState: function () {
    return {
      hiddenServices: [],
      mesosStateErrorCount: 0,
      showServices: false
    };
  },

  componentWillMount: function () {
    this.internalStorage_set({
      resourcesByFramework: {},
      serviceColors: {}
    });

    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );

    MesosStateStore.addChangeListener(
      EventTypes.MESOS_STATE_REQUEST_ERROR,
      this.onMesosStateRequestError
    );
  },

  componentWillUnmount: function () {
    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );

    MesosStateStore.removeChangeListener(
      EventTypes.MESOS_STATE_REQUEST_ERROR,
      this.onMesosStateRequestError
    );
  },

  /**
   * Updates metadata on services when services are added/removed
   *
   * @param  {Object} props
   */
  componentWillReceiveProps: function (props) {
    let ids = props.services.map(function (service) {
      return service.id;
    });

    let serviceColors = this.internalStorage_get().serviceColors;

    if (!deepEqual(Object.keys(serviceColors), ids)) {
      this.computeServiceColors(props.services);
      this.computeShownServices(props.services);
    }
  },

  onMesosStateChange: function () {
    var data = this.internalStorage_get();
    var resourcesByFramework = data.resourcesByFramework;
    // Maps the usage of each service per node
    // This can change at anytime. This info is only available at /state
    var slaves = MesosStateStore.getHostResourcesByFramework(
      data.hiddenServices
    );

    if (!deepEqual(resourcesByFramework, slaves)) {
      this.internalStorage_update({resourcesByFramework: slaves});
    }
  },

  onMesosStateRequestError: function () {
    this.setState({mesosStateErrorCount: this.state.mesosStateErrorCount + 1});
  },

  computeServiceColors: function (services) {
    var colors = {};

    services.forEach(function (service, index) {
      // Drop all others into the same 'other' color
      if (index < MAX_SERVICES_TO_SHOW) {
        colors[service.id] = index;
      } else {
        colors.other = OTHER_SERVICES_COLOR;
      }
    });

    this.internalStorage_update({serviceColors: colors});
  },

  computeShownServices: function (services) {
    var hidden = services.slice(MAX_SERVICES_TO_SHOW).map(function (service) {
      return service.id;
    });

    this.internalStorage_update({hiddenServices: hidden});
  },

  handleShowServices: function (e) {
    this.setState({showServices: e.currentTarget.checked});
  },

  hasLoadingError: function () {
    return this.state.mesosStateErrorCount >= 3;
  },

  getLoadingScreen: function () {
    var hasLoadingError = this.hasLoadingError();
    var errorMsg = null;
    if (hasLoadingError) {
      errorMsg = <RequestErrorMsg />;
    }

    var loadingClassSet = classNames({
      'hidden': hasLoadingError
    });

    return (
      <div className="text-align-center vertical-center">
        <div className="row">
          <div className={loadingClassSet}>
            <div className="ball-scale">
              <div />
            </div>
          </div>
          {errorMsg}
        </div>
      </div>
    );
  },

  getActiveServiceIds: function (nodes) {
    var serviceIDs = {};

    nodes.forEach(function (node) {
      node.getServiceIDs().forEach(function (id) {
        serviceIDs[id] = true;
      });
    });

    return Object.keys(serviceIDs);
  },

  getServicesList: function (props) {
    // Return a list of unique service IDs from the selected hosts.
    var activeServiceIds = this.getActiveServiceIds(props.hosts);
    var data = this.internalStorage_get();

    // Filter out inactive services
    var items = props.services.filter(function (service) {
      return activeServiceIds.includes(service.id);
    })
    // Limit to max amount
    .slice(0, MAX_SERVICES_TO_SHOW)
    // Return view definition
    .map(function (service) {
      var color = data.serviceColors[service.id];
      var className = `service-legend-color service-color-${color}`;

      return (
        <li key={service.id}>
          <span className={className}></span>
          <span>{service.name}</span>
        </li>
      );
    });

    // Add 'Others' node to the list
    if (activeServiceIds.length > MAX_SERVICES_TO_SHOW) {
      var classNameOther = 'service-legend-color service-color-' +
        OTHER_SERVICES_COLOR;
      items.push(
        <li key="other">
          <span className={classNameOther}></span>
          <span>Other</span>
        </li>
      );
    }

    return (
      <ul className="list list-unstyled nodes-grid-service-list">
      {items}
      </ul>
    );
  },

  getNodesGrid: function () {
    var data = this.internalStorage_get();
    var props = this.props;
    var state = this.state;

    var classSet = classNames({
      'side-list nodes-grid-legend': true,
      'disabled': !state.showServices
    });

    return (
      <div className="nodes-grid">

        <div className={classSet}>
          <label className="show-services-label h5 flush-top">
            <input type="checkbox"
              name="nodes-grid-show-services"
              checked={state.showServices}
              onChange={this.handleShowServices} />
            Show Services by Share
          </label>

          {this.getServicesList(props)}
        </div>

        <NodesGridDials
          hosts={props.hosts}
          selectedResource={props.selectedResource}
          serviceColors={data.serviceColors}
          resourcesByFramework={data.resourcesByFramework}
          showServices={state.showServices} />
      </div>
    );
  },

  render: function () {
    var showLoading = this.hasLoadingError() ||
      Object.keys(MesosStateStore.get('lastMesosState')).length === 0;

    if (showLoading) {
      return this.getLoadingScreen();
    } else {
      return this.getNodesGrid();
    }
  }

});

module.exports = NodesGridView;
