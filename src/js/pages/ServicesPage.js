var React = require('react');
import {RouteHandler} from 'react-router';
import {StoreMixin} from 'mesosphere-shared-reactjs';

var AlertPanel = require('../components/AlertPanel');
import Config from '../config/Config';
import DCOSStore from '../stores/DCOSStore';
import Page from '../components/Page';
var ServicesTable = require('../components/ServicesTable');
var ServiceTree = require('../structs/ServiceTree');
var SidebarActions = require('../events/SidebarActions');
import SidePanels from '../components/SidePanels';

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

  getContents: function () {
    let serviceTreeId =
      decodeURIComponent(this.context.router.getCurrentParams().serviceTreeId);
    let services = this.getServices(serviceTreeId);

    if (services.length > 0) {
      return (
        <div>
          <ServicesTable
            services={services} />
          <SidePanels
            params={this.props.params}
            openedPage="services" />
        </div>
      );
    }

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
    return (
      <Page title="Services">
        {this.getContents()}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
