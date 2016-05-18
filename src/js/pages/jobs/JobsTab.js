import React from 'react';
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import AlertPanel from '../../components/AlertPanel';
import DCOSStore from '../../stores/DCOSStore';
import QueryParamsMixin from '../../mixins/QueryParamsMixin';
import SidebarActions from '../../events/SidebarActions';

var JobsTab = React.createClass({

  displayName: 'JobsTab',

  mixins: [StoreMixin, QueryParamsMixin],

  statics: {
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

  componentWillMount: function () {
    this.store_listeners = [{name: 'dcos', events: ['change']}];
  },

  getContents: function () {
    // Render loading screen
    if (!DCOSStore.dataProcessed) {
      return (
        <div className="container container-fluid container-pod text-align-center
            vertical-center inverse">
          <div className="row">
            <div className="ball-scale">
              <div />
            </div>
          </div>
        </div>
      );
    }

    if (this.props.params.taskID) {
      return (
        <RouteHandler />
      );
    }

    // Render empty panel
    return (
      <AlertPanel
        title="No Jobs Found"
        iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-jobs flush-top">
        <p className="flush-bottom">
         Jobs aren't available yet.
        </p>
      </AlertPanel>
    );
  },

  render: function () {
    let {id} = this.props.params;

    return this.getContents(decodeURIComponent(id));
  }

});

module.exports = JobsTab;
