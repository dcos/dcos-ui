import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';

const DecinedOffersUtil = {
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

    let requestedResources = {};

    if (pod != null) {
      const {containers = []} = pod;

      requestedResources = containers.reduce((accumulator, container) => {
        accumulator.role.push(container.acceptedRole || ['*']);
        accumulator.cpu += container.resources.cpus || 0;
        accumulator.mem += container.resources.mem || 0;
        accumulator.disk += container.resources.disk || 0;

        if (container.constraints) {
          accumulator.constraints.push(container.constraints);
        }

        if (container.resources.ports) {
          accumulator.ports.push(container.resources.ports);
        }

        return accumulator;
      }, {
        role: [],
        constraints: [],
        cpu: 0,
        mem: 0,
        disk: 0,
        ports: []
      });
    } else {
      requestedResources = {
        role: [app.acceptedRole || ['*']],
        constraints: [app.constraints],
        cpu: app.cpus || 0,
        mem: app.mem || 0,
        disk: app.disk || 0,
        ports: [app.ports] || [[]]
      };
    }

    return {
      role: {
        requested: requestedResources.role,
        offers: roleOfferSummary.processed,
        matched: roleOfferSummary.processed - roleOfferSummary.declined
      },
      constraint: {
        requested: requestedResources.constraints,
        offers: constraintOfferSummary.processed,
        matched: constraintOfferSummary.processed
          - constraintOfferSummary.declined
      },
      cpu: {
        requested: requestedResources.cpu,
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
        requested: requestedResources.ports,
        offers: portOfferSummary.processed,
        matched: portOfferSummary.processed - portOfferSummary.declined
      }
    };
  },

  getOffersFromQueue(queue) {
    let {lastUnusedOffers = []} = queue;

    if (!lastUnusedOffers.length) {
      return null;
    }

    return lastUnusedOffers.map((declinedOffer) => ({
      hostname: declinedOffer.offer.hostname,
      timestamp: declinedOffer.timestamp,
      unmatchedResource: declinedOffer.reason
    }));
  }
};

module.exports = DecinedOffersUtil;
