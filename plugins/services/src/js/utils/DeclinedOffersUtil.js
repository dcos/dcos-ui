import DateUtil from '../../../../../src/js/utils/DateUtil';
import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';
import ServiceTree from '../structs/ServiceTree';
import Util from '../../../../../src/js/utils/Util';

const DEPLOYMENT_WARNING_DELAY_MS = 1000 * 60 * 5;
const UNAVAILABLE_TEXT = 'N/A';

const rangeReducer = (accumulator, range) => {
  accumulator.push(`${range.begin} – ${range.end}`);

  return accumulator;
};

const constraintsReducer = (accumulator, constraint) => {
  const {name, ranges, set, text, scalar} = constraint;
  let value = null;

  if (ranges) {
    value = ranges.reduce(rangeReducer, []).join(', ');
  } else if (set) {
    value = set.join(', ');
  } else if (text) {
    value = text;
  } else if (scalar) {
    value = scalar;
  }

  if (!value) {
    value = UNAVAILABLE_TEXT;
  }

  accumulator.push(`${name}:${value}`);

  return accumulator;
};

const DeclinedOffersUtil = {
  getAppsWithDeclinedOffersFromServiceTree(serviceTree = {}) {
    if (!serviceTree.list || serviceTree.list.length === 0) {
      return [];
    }

    return serviceTree.list.reduce((accumulator, item) => {
      if (item instanceof ServiceTree) {
        accumulator = accumulator.concat(
          DeclinedOffersUtil.getAppsWithDeclinedOffersFromServiceTree(item)
        );
      } else if (DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(
          item.getQueue()
        )) {
        accumulator.push(item);
      }

      return accumulator;
    }, []);
  },

  getSummaryFromQueue(queue) {
    const {app, pod, processedOffersSummary = {}} = queue;

    if (!processedOffersSummary.unusedOffersCount) {
      return null;
    }

    const {rejectSummaryLastOffers = []} = processedOffersSummary;
    const declinedOffersMap = {};

    // Construct map of summary.
    rejectSummaryLastOffers.forEach(({reason, declined, processed}) => {
      declinedOffersMap[reason] = {declined, processed};
    });

    const roleOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.UNFULFILLED_ROLE
    ];
    const constraintOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.UNFULFILLED_CONSTRAINT
    ];
    const cpuOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.INSUFFICIENT_CPU
    ];
    const memOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.INSUFFICIENT_MEM
    ];
    const diskOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.INSUFFICIENT_DISK
    ];
    const portOfferSummary = declinedOffersMap[
      DeclinedOffersReasons.INSUFFICIENT_PORTS
    ];

    let requestedResources = null;

    if (pod != null) {
      const {containers = []} = pod;

      requestedResources = containers.reduce((accumulator, container) => {
        // Tally the total number of requested resources.
        accumulator.cpus += (
          Util.findNestedPropertyInObject(container, 'resources.cpus') || 0
        );
        accumulator.mem += (
          Util.findNestedPropertyInObject(container, 'resources.mem') || 0
        );
        accumulator.disk += (
          Util.findNestedPropertyInObject(container, 'resources.disk') || 0
        );

        // Push ports to the ports array if defined.
        const ports = Util.findNestedPropertyInObject(
          container, 'resources.ports'
        );

        if (ports) {
          accumulator.ports.push(ports);
        }

        return accumulator;
      }, {
        roles: Util.findNestedPropertyInObject(
          pod, 'scheduling.placement.acceptedResourceRoles'
        ) || ['*'],
        constraints: Util.findNestedPropertyInObject(
          pod, 'scheduling.placement.constraints'
        ) || [],
        cpus: Util.findNestedPropertyInObject(
          pod, 'executorResources.cpus'
        ) || 0,
        mem: Util.findNestedPropertyInObject(
          pod, 'executorResources.mem'
        ) || 0,
        disk: Util.findNestedPropertyInObject(
          pod, 'executorResources.disk'
        ) || 0,
        ports: []
      });
    } else {
      requestedResources = {
        roles: Util.findNestedPropertyInObject(
            app, 'acceptedResourceRoles'
          ) || ['*'],
        constraints: Util.findNestedPropertyInObject(
          app, 'constraints'
        ) || [],
        cpus: app.cpus || 0,
        mem: app.mem || 0,
        disk: app.disk || 0,
        ports: [app.ports] || [[]]
      };
    }

    return {
      roles: {
        requested: requestedResources.roles.join(', ') || UNAVAILABLE_TEXT,
        offers: roleOfferSummary.processed,
        matched: roleOfferSummary.processed - roleOfferSummary.declined
      },
      constraints: {
        requested: requestedResources.constraints.map((constraint = []) => {
          return constraint.join(':');
        }).join(', ') || UNAVAILABLE_TEXT,
        offers: constraintOfferSummary.processed,
        matched: constraintOfferSummary.processed
          - constraintOfferSummary.declined
      },
      cpus: {
        requested: requestedResources.cpus,
        offers: cpuOfferSummary.processed,
        matched: cpuOfferSummary.processed - cpuOfferSummary.declined
      },
      mem: {
        requested: requestedResources.mem,
        offers: memOfferSummary.processed,
        matched: memOfferSummary.processed - memOfferSummary.declined
      },
      disk: {
        requested: requestedResources.disk,
        offers: diskOfferSummary.processed,
        matched: diskOfferSummary.processed - diskOfferSummary.declined
      },
      ports: {
        requested: requestedResources.ports.map((resourceArr = []) => {
          return resourceArr.join(', ');
        }).join(', ') || UNAVAILABLE_TEXT,
        offers: portOfferSummary.processed,
        matched: portOfferSummary.processed - portOfferSummary.declined
      }
    };
  },

  getOffersFromQueue(queue) {
    const {lastUnusedOffers = []} = queue;

    if (!lastUnusedOffers.length) {
      return null;
    }

    return lastUnusedOffers.map((declinedOffer) => {
      const {
        offer: {
          attributes = [],
          hostname,
          resources = []
        },
        timestamp
      } = declinedOffer;

      return {
        hostname,
        timestamp,
        unmatchedResource: declinedOffer.reason,
        offered: resources.reduce((accumulator, resource) => {
          const {name, role} = resource;

          if (name === 'ports') {
            const {ranges = []} = resource;

            accumulator[name] = ranges.reduce(rangeReducer, []);
          } else {
            accumulator[name] = resource.scalar;
          }

          // Accumulate all roles.
          if (!accumulator.roles.includes(role) && role) {
            accumulator.roles.push(role);
          }

          return accumulator;
        }, {
          constraints: attributes.reduce(constraintsReducer, []).join(', '),
          roles: []
        })
      };
    });
  },

  getTimeWaiting(queue) {
    return Util.findNestedPropertyInObject(
        queue, 'processedOffersSummary.lastUsedOfferAt'
      ) || queue.since;
  },

  shouldDisplayDeclinedOffersWarning(queue) {
    if (queue == null) {
      return false;
    }

    return Date.now()
      - DateUtil.strToMs(DeclinedOffersUtil.getTimeWaiting(queue))
      >= DEPLOYMENT_WARNING_DELAY_MS;
  }
};

module.exports = DeclinedOffersUtil;
