var React = require('react');
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

var AlertPanel = require('../components/AlertPanel');
import Config from '../config/Config';
import DCOSStore from '../stores/DCOSStore';
import Page from '../components/Page';
import Service from '../structs/Service';
import ServiceDetail from '../components/ServiceDetail';
import ServicesTable from '../components/ServicesTable';
import ServiceTree from '../structs/ServiceTree';
import SidebarActions from '../events/SidebarActions';

var ServicesPage = React.createClass({

  displayName: 'ServicesPage',

  mixins: [StoreMixin],

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

  componentWillMount: function () {
    this.store_listeners = [{name: 'dcos', events: ['change']}];
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

  getContents: function (id) {
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

    // Find item in root tree and default to root tree if there is no match
    let item = DCOSStore.serviceTree.findItemById(id) || DCOSStore.serviceTree;

    // Render service table
    if (item instanceof ServiceTree && item.getItems().length > 0) {
      return (<ServicesTable services={item.getItems()}/>);
    }

    // Render service detail
    if (item instanceof Service) {
      return (<ServiceDetail service={item}/>);
    }

    // Render empty panel
    return (
      <AlertPanel
        title="No Services Installed"
        iconClassName="icon icon-sprite icon-sprite-jumbo
          icon-sprite-jumbo-white icon-services flush-top">
        <p className="flush-bottom">
          Use the {Config.productName} command line tools to find and install
          services.
        </p>
      </AlertPanel>
    );
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
