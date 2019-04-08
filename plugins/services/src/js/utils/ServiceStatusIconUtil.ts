import DateUtil from "#SRC/js/utils/DateUtil";

import Pod from "../structs/Pod";
import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";
import DeclinedOffersUtil from "../utils/DeclinedOffersUtil";

interface ServiceQueue {
  since: string | null;
}

const isUnableToLaunch = (service: Service | Pod | ServiceTree) => {
  const queue = service.getQueue() as ServiceQueue | null;
  const UNABLE_TO_LAUNCH_TIMEOUT = 1000 * 60 * 30;

  if (queue == null) {
    return false;
  }

  return (
    Date.now() - (DateUtil.strToMs(queue.since) || 0) >=
    UNABLE_TO_LAUNCH_TIMEOUT
  );
};

export function getStatusIconProps(service: Service | ServiceTree | Pod) {
  const queue = service.getQueue() as ServiceQueue | null;
  const isServiceTree = service instanceof ServiceTree;
  const unableToLaunch = isUnableToLaunch(service);
  const appsWithWarnings = isServiceTree
    ? (service as ServiceTree)
        .filterItems((item: any) => {
          if (!(item instanceof ServiceTree)) {
            return (
              DeclinedOffersUtil.displayDeclinedOffersWarning(item) ||
              isUnableToLaunch(item)
            );
          }

          return false;
        })
        .flattenItems()
        .getItems().length
    : null;

  return {
    id: service.getId(),
    timeWaiting: queue ? DeclinedOffersUtil.getTimeWaiting(queue) : null,
    timeQueued: queue ? DateUtil.strToMs(queue.since) : null,
    serviceStatus: service.getServiceStatus(),
    isServiceTree,
    isService: service instanceof Service,
    displayDeclinedOffers: DeclinedOffersUtil.displayDeclinedOffersWarning(
      service
    ),
    appsWithWarnings,
    unableToLaunch
  };
}
