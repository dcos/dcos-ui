import deepEqual from 'deep-equal';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CompositeState from '../../../../../../../src/js/structs/CompositeState';
import MesosStateStore from '../../../../../../../src/js/stores/MesosStateStore';
import NodesGridView from '../../../components/NodesGridView';
import QueryParamsMixin from '../../../../../../../src/js/mixins/QueryParamsMixin';

const MAX_SERVICES_TO_SHOW = 32;
const METHODS_TO_BIND=['handleShowServices'];

class NodesGridContainer extends mixin(StoreMixin, QueryParamsMixin) {

  constructor() {
    super(...arguments);

    this.state = {
      filters: {health: 'all', name: '', service: null},
      filteredNodes: [],
      hasLoadingError: false,
      hiddenServices: [],
      lastMesosStateWasEmpty: true,
      mesosStateErrorCount: 0,
      nodeHealthResponseReceived: false,
      resourcesByFramework: {},
      serviceColors: {},
      showServices: false
    };
    this.store_listeners = [
      {
        name: 'nodeHealth',
        events: ['success'],
        listenAlways: false,
        suppressUpdate: true
      },
      {
        name: 'state',
        events: ['success', 'error'],
        suppressUpdate: true
      }
    ];
    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(props) {
    const {services, query} = props;
    let ids = services.map(function (service) {
      return service.id;
    });

    let {serviceColors} = this.state;

    if (!deepEqual(Object.keys(serviceColors), ids)) {
      this.computeServiceColors(services);
      this.computeShownServices(services);
    }

    const filters = {
      health: query.filterHealth || 'all',
      name: query.searchString || '',
      service: query.filterService || null
    };
    this.setFilters(filters);
  }

  computeServiceColors(services) {
    var colors = {};

    services.forEach(function (service, index) {
      // Drop all others into the same 'other' color
      if (index < MAX_SERVICES_TO_SHOW) {
        colors[service.id] = index;
      } else {
        colors.other = OTHER_SERVICES_COLOR;
      }
    });

    this.setState({serviceColors: colors});
  }

  computeShownServices(services) {
    var hidden = services.slice(MAX_SERVICES_TO_SHOW).map(function (service) {
      return service.id;
    });

    this.setState({hiddenServices: hidden});
  }

  getFilteredNodes(filters = this.state.filters) {
    return CompositeState.getNodesList().filter(filters).getItems();
  }

  setFilters(newFilters, callback) {
    if (newFilters.service === '') {
      newFilters.service = null;
    }
    const filters = Object.assign({}, this.state.filters, newFilters);
    const filteredNodes = this.getFilteredNodes(filters);

    this.setState({filters, filteredNodes}, callback);
  }

  handleShowServices(e) {
    this.setState({showServices: e.currentTarget.checked});
  }

  onStateStoreSuccess() {
    const {hiddenServices} = this.state;
    const resourcesByFramework = MesosStateStore.getHostResourcesByFramework(hiddenServices);
    const lastMesosStateWasEmpty = Object.keys(MesosStateStore.get('lastMesosState')).length === 0;
    this.setState({resourcesByFramework, lastMesosStateWasEmpty});
  }

  onStateStoreError() {
    const mesosStateErrorCount = this.state.mesosStateErrorCount + 1;
    if (mesosStateErrorCount > 3) {
      this.setState({mesosStateErrorCount, hasLoadingError: true});
    } else {
      this.setState({mesosStateErrorCount});
    }
  }

  onNodeHealthStoreSuccess() {
    this.setState({
      nodeHealthResponseReceived: true,
      filteredNodes: this.getFilteredNodes()
    });
  }

  render() {
    const {
      filteredNodes,
      hasLoadingError,
      hiddenServices,
      lastMesosStateWasEmpty,
      nodeHealthResponseReceived,
      serviceColors,
      showServices,
      resourcesByFramework
    } = this.state;

    const {services, selectedResource} = this.props;
    return (
      <NodesGridView
        hasLoadingError={hasLoadingError}
        hiddenServices={hiddenServices}
        hosts={filteredNodes}
        lastMesosStateWasEmpty={lastMesosStateWasEmpty}
        onShowServices={this.handleShowServices}
        nodeHealthResponseReceived={nodeHealthResponseReceived}
        resourcesByFramework={resourcesByFramework}
        selectedResource={selectedResource}
        serviceColors={serviceColors}
        services={services}
        showServices={showServices} />
    );
  }
}

NodesGridContainer.contextTypes = {
  router: React.PropTypes.func.isRequired,
  selectedResource: React.PropTypes.string
};

module.exports = NodesGridContainer;
