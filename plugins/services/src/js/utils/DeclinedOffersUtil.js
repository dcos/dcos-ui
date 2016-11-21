import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';

const DecinedOffersUtil = {
  getSummaryFromQueue(queue) {
    const {app, processedOffersSummary} = queue;

    if (processedOffersSummary == null
      || processedOffersSummary.unusedOffersCount === 0) {
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

    return {
      role: {
        requested: app.acceptedRole || ['*'],
        offers: roleOfferSummary.processed,
        matched: roleOfferSummary.processed - roleOfferSummary.declined
      },
      constraint: {
        requested: app.constraints,
        offers: constraintOfferSummary.processed,
        matched: constraintOfferSummary.processed
          - constraintOfferSummary.declined
      },
      cpu: {
        requested: app.cpus || 0,
        offers: cpuOfferSummary.processed,
        matched: cpuOfferSummary.processed - cpuOfferSummary.declined
      },
      mem: {
        requested: app.mem || 0,
        offers: memOfferSummary.processed,
        matched: memOfferSummary.processed - memOfferSummary.declined
      },
      disk: {
        requested: app.disk || 0,
        offers: diskOfferSummary.processed,
        matched: diskOfferSummary.processed - diskOfferSummary.declined
      },
      ports: {
        requested: app.ports,
        offers: portOfferSummary.processed,
        matched: portOfferSummary.processed - portOfferSummary.declined
      }
    };
  },

  getOffersFromQueue(queue) {
    let {lastUnusedOffers} = queue;

    if (lastUnusedOffers == null || lastUnusedOffers.length === 0) {
      return null;
    }

    return lastUnusedOffers.map((declinedOffer) => {
      return {
        hostname: declinedOffer.offer.hostname,
        timestamp: declinedOffer.timestamp,
        unmatchedResource: declinedOffer.reason
      };
    });
  }
};

module.exports = DecinedOffersUtil;
