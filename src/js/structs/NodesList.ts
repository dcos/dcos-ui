import List from "./List";
import MesosSummaryUtil from "../utils/MesosSummaryUtil";
import Node from "./Node";
import StringUtil from "../utils/StringUtil";
import UnitHealthUtil from "../utils/UnitHealthUtil";

export default class NodesList extends List<Node> {
  static type = Node;
  filter(filters) {
    let hosts = this.getItems();

    if (filters) {
      // Marathon API
      if (filters.ids) {
        hosts = hosts.filter((host) => filters.ids.includes(host.id));
      }

      // Marathon API
      if (filters.service != null) {
        hosts = hosts.filter(({ framework_ids = [] }) =>
          framework_ids.includes(filters.service)
        );
      }

      // Marathon APIs
      if (filters.name) {
        hosts = StringUtil.filterByString(hosts, "hostname", filters.name);
      }

      // Component Health APIs
      if (filters.ip) {
        hosts = StringUtil.filterByString(hosts, "host_ip", filters.ip);
      }

      // Component Health API
      if (filters.health) {
        hosts = UnitHealthUtil.filterByHealth(hosts, filters.health);
      }
    }

    return new NodesList({ items: hosts });
  }

  sumUsedResources() {
    const services = this.getItems();
    const resourcesList = services.map((service) => service.used_resources);

    return MesosSummaryUtil.sumResources(resourcesList);
  }

  sumResources() {
    const services = this.getItems();
    const resourcesList = services.map((service) => service.resources);

    return MesosSummaryUtil.sumResources(resourcesList);
  }
}
