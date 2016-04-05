import List from './List';
import MesosSummaryUtil from '../utils/MesosSummaryUtil';
import Node from './Node';
import StringUtil from '../utils/StringUtil';
import UnitHealthUtil from '../utils/UnitHealthUtil';

module.exports = class NodesList extends List {
  constructor() {
    super(...arguments);

    // Replace list items instances of Node
    this.list = this.list.map(function (item) {
      if (item instanceof Node) {
        return item;
      } else {
        return new Node(item);
      }
    });
  }

  filter(filters) {
    let hosts = this.getItems();

    if (filters) {

      // Marathon API
      if (filters.ids) {
        hosts = hosts.filter(function (host) {
          return this.ids.indexOf(host.id) !== -1;
        }, {ids: filters.ids});
      }

      // Marathon API
      if (filters.service != null) {
        hosts = MesosSummaryUtil.filterHostsByService(hosts, filters.service);
      }

      // Marathon APIs
      if (filters.name) {
        hosts = StringUtil.filterByString(hosts, 'hostname', filters.name);
      }

      // Component Health APIs
      if (filters.ip) {
        hosts = StringUtil.filterByString(hosts, 'host_ip', filters.ip);
      }

      // Component Health API
      if (filters.health) {
        hosts = UnitHealthUtil.filterByHealth(hosts, filters.health);
      }
    }

    return new NodesList({items: hosts});
  }

  sumUsedResources() {
    let services = this.getItems();
    let resourcesList = services.map(function (service) {
      return service.used_resources || null;
    });

    return MesosSummaryUtil.sumResources(resourcesList);
  }

  sumResources() {
    let services = this.getItems();
    let resourcesList = services.map(function (service) {
      return service.resources || null;
    });

    return MesosSummaryUtil.sumResources(resourcesList);
  }
};
