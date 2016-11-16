import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';

const DecinedOffersUtil = {
  getSummaryFromQueue(queue) {
    const {app, lastUnusedOffers, processedOffersSummary} = queue;

    if (processedOffersSummary == null
      || processedOffersSummary.unusedOffersCount === 0
      || lastUnusedOffers == null
      || lastUnusedOffers.length === 0) {
      return null;
    }

    const {processedOffersCount = 0, rejectReason = {}} = processedOffersSummary;
    const matchedRoleOffers = processedOffersCount -
      (rejectReason[DeclinedOffersReasons.UNFULFILLED_ROLE] || 0);
    const matchedConstraintOffers = matchedRoleOffers -
      (rejectReason[DeclinedOffersReasons.UNFULFILLED_CONSTRAINT] || 0);
    const matchedCPUOffers = matchedConstraintOffers -
      (rejectReason[DeclinedOffersReasons.INSUFFICIENT_CPU] || 0);
    const matchedMemOfffers = matchedConstraintOffers -
      (rejectReason[DeclinedOffersReasons.INSUFFICIENT_MEM] || 0);
    const matchedDiskOffers = matchedConstraintOffers -
      (rejectReason[DeclinedOffersReasons.INSUFFICIENT_DISK] || 0);
    const matchedPortOffers = matchedConstraintOffers -
      (rejectReason[DeclinedOffersReasons.INSUFFICIENT_PORTS] || 0);

    return {
      role: {
        requested: app.acceptedRole || ['*'],
        offers: processedOffersCount,
        matched: matchedRoleOffers
      },
      constraint: {
        requested: app.constraints,
        offers: matchedRoleOffers,
        matched: matchedConstraintOffers
      },
      cpu: {
        requested: app.cpus || 0,
        offers: matchedConstraintOffers,
        matched: matchedCPUOffers
      },
      mem: {
        requested: app.mem || 0,
        offers: matchedConstraintOffers,
        matched: matchedMemOfffers
      },
      disk: {
        requested: app.disk || 0,
        offers: matchedConstraintOffers,
        matched: matchedDiskOffers
      },
      ports: {
        requested: app.ports,
        offers: matchedConstraintOffers,
        matched: matchedPortOffers
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
