import List from './List';
import MesosSummaryUtil from '../utils/MesosSummaryUtil';
import Node from './Node';
import StringUtil from '../utils/StringUtil';
import UnitHealthUtil from '../utils/UnitHealthUtil';

class NodesList extends List {
  filter(filters) {
    let hosts = this.getItems();

    if (filters) {

      // Marathon API
      if (filters.ids) {
        hosts = hosts.filter(function (host) {
          return filters.ids.includes(host.id);
        });
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
      return service.used_resources;
    });

    return MesosSummaryUtil.sumResources(resourcesList);
  }

  sumResources() {
    let services = this.getItems();
    let resourcesList = services.map(function (service) {
      return service.resources;
    });

    return MesosSummaryUtil.sumResources(resourcesList);
  }
};

NodesList.type = Node;

module.exports = NodesList;
