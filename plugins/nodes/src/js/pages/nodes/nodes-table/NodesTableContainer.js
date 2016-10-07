import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CompositeState from '../../../../../../../src/js/structs/CompositeState';
import NodesTable from '../../../components/NodesTable';
import QueryParamsMixin from '../../../../../../../src/js/mixins/QueryParamsMixin';

class NodesTableContainer extends mixin(StoreMixin, QueryParamsMixin) {

  constructor() {
    super(...arguments);

    this.state = {
      filters: {health: 'all', name: '', service: null},
      filteredNodes: [],
      nodeHealthResponseReceived: false
    };
    this.store_listeners = [
      {
        name: 'nodeHealth',
        events: ['success'],
        listenAlways: false,
        suppressUpdate: true
      }
    ];
  }

  componentWillReceiveProps(router) {
    let {query} = router;

    const filters = {
      health: query.filterHealth || 'all',
      name: query.searchString || '',
      service: query.filterService || null
    };
    this.setFilters(filters);
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

  onNodeHealthStoreSuccess() {
    this.setState({
      nodeHealthResponseReceived: true,
      filteredNodes: this.getFilteredNodes()
    });
  }

  render() {
    let {nodeHealthResponseReceived, filteredNodes} = this.state;

    return (
      <NodesTable
        nodeHealthResponseReceived={nodeHealthResponseReceived}
        hosts={filteredNodes} />
    );
  }
}

NodesTableContainer.contextTypes = {
  router: React.PropTypes.func.isRequired
};

module.exports = NodesTableContainer;
