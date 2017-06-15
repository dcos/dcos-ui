import Framework from "../structs/Framework";
import Pod from "../structs/Pod";
import ServiceOther from "../constants/ServiceOther";
import ServiceTree from "../structs/ServiceTree";

function getCountByType(services) {
  const universeKey = ServiceOther.UNIVERSE.key;
  const volumesKey = ServiceOther.VOLUMES.key;
  const podsKey = ServiceOther.PODS.key;

  return services.reduce(
    function(memo, service) {
      if (service instanceof ServiceTree) {
        return memo;
      }

      const serviceStatus = service.getServiceStatus();
      const serviceHealth = service.getHealth();

      if (memo.filterStatus[serviceStatus.key] === undefined) {
        memo.filterStatus[serviceStatus.key] = 1;
      } else {
        memo.filterStatus[serviceStatus.key]++;
      }

      if (memo.filterHealth[serviceHealth.value] === undefined) {
        memo.filterHealth[serviceHealth.value] = 1;
      } else {
        memo.filterHealth[serviceHealth.value]++;
      }

      if (service instanceof Framework) {
        if (memo.filterOther[universeKey] === undefined) {
          memo.filterOther[universeKey] = 1;
        } else {
          memo.filterOther[universeKey]++;
        }
      }

      if (service instanceof Pod) {
        if (memo.filterOther[podsKey] === undefined) {
          memo.filterOther[podsKey] = 1;
        } else {
          memo.filterOther[podsKey]++;
        }
      }

      const volumes = service.getVolumes();
      if (volumes.list && volumes.list.length > 0) {
        if (memo.filterOther[volumesKey] === undefined) {
          memo.filterOther[volumesKey] = 1;
        } else {
          memo.filterOther[volumesKey]++;
        }
      }

      return memo;
    },
    { filterHealth: {}, filterStatus: {}, filterOther: {} }
  );
}

module.exports = {
  getCountByType
};
