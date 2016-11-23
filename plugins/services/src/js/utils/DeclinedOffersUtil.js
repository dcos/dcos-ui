import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';
import Units from '../../../../../src/js/utils/Units';
import Util from '../../../../../src/js/utils/Util';

const unavailableText = 'N/A';

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
    value = unavailableText;
  }

  accumulator.push(`${name}:${value}`);

  return accumulator;
};

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
        let ports = Util.findNestedPropertyInObject(
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
        cpus: 0,
        mem: 0,
        disk: 0,
        ports: []
      });
    } else {
      requestedResources = {
        roles: Util.findNestedPropertyInObject(
            app, 'scheduling.placement.acceptedResourceRoles'
          ) || ['*'],
        constraints: Util.findNestedPropertyInObject(
          app, 'scheduling.placement.constraints'
        ) || [],
        cpus: app.cpus || 0,
        mem: app.mem || 0,
        disk: app.disk || 0,
        ports: [app.ports] || [[]]
      };
    }

    return {
      roles: {
        requested: requestedResources.roles.join(', ') || unavailableText,
        offers: roleOfferSummary.processed,
        matched: roleOfferSummary.processed - roleOfferSummary.declined
      },
      constraints: {
        requested: requestedResources.constraints.map((constraint = []) => {
          return constraint.join(':');
        }).join(', ') || unavailableText,
        offers: constraintOfferSummary.processed,
        matched: constraintOfferSummary.processed
          - constraintOfferSummary.declined
      },
      cpus: {
        requested: Units.formatResource('cpus', requestedResources.cpus),
        offers: cpuOfferSummary.processed,
        matched: cpuOfferSummary.processed - cpuOfferSummary.declined
      },
      mem: {
        requested: Units.formatResource('mem', requestedResources.mem),
        offers: memOfferSummary.processed,
        matched: memOfferSummary.processed - memOfferSummary.declined
      },
      disk: {
        requested: Units.formatResource('disk', requestedResources.disk),
        offers: diskOfferSummary.processed,
        matched: diskOfferSummary.processed - diskOfferSummary.declined
      },
      ports: {
        requested: requestedResources.ports.map((resourceArr = []) => {
          return resourceArr.join(', ');
        }).join(', ') || unavailableText,
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
  }
};

module.exports = DecinedOffersUtil;
