import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import Units from '../../../../../src/js/utils/Units';
import Util from '../../../../../src/js/utils/Util';

const displayedResourceValues = {
  role: 'Role',
  constraint: 'Constraint',
  resources: 'CPU/MEM/DISK',
  resourcesWithGPUs: 'CPU/MEM/DISK/GPU',
  ports: 'Ports'
};

const getColumnClassNameFn = (classes) => {
  return (prop, sortBy) => {
    return classNames(classes, {
      'active': prop === sortBy.prop
    });
  };
};

const getColumnHeadingFn = (defaultHeading) => {
  return (prop, order, sortBy) => {
    let caretClassNames = classNames('caret', {
      [`caret--${order}`]: order != null,
      'caret--visible': sortBy.prop === prop
    });

    return (
      <span>
        {defaultHeading || prop}
        <span className={caretClassNames} />
      </span>
    );
  };
};

const columns = [
  {
    heading: getColumnHeadingFn('Resource'),
    prop: 'resource',
    render: (prop, row) => {
      let resource = row[prop];

      if (resource === 'resources'
        && (row.requested.gpus !== null && row.requested.gpus > 0)) {
        resource = 'resourcesWithGPUs';
      }

      return displayedResourceValues[resource];
    },
    className: getColumnClassNameFn(),
    sortable: true
  },
  {
    heading: getColumnHeadingFn('Requested'),
    prop: 'requested',
    className: getColumnClassNameFn(),
    render: (prop, row) => {
      const requestedResource = row[prop];

      if (Array.isArray(requestedResource)) {
        return requestedResource.join(', ');
      }

      if (Util.isObject(requestedResource) && row.resource === 'resources') {
        const valuesToDisplay = [
          Units.formatResource('cpu', requestedResource.cpu),
          Units.formatResource('mem', requestedResource.mem),
          Units.formatResource('disk', requestedResource.disk)
        ];

        // Display GPUs only if they are defined and more than 0.
        if (requestedResource.gpus != null && requestedResource.gpus !== 0) {
          valuesToDisplay.push(
            Units.formatResource('gpu', requestedResource.gpus)
          );
        }

        return valuesToDisplay.join(' / ');
      }

      return requestedResource;
    },
    sortable: true
  },
  {
    heading: getColumnHeadingFn('Matched'),
    prop: 'matched',
    className: getColumnClassNameFn(),
    render: (prop, row) => {
      const matchedOffers = row[prop];
      const offeredCount = row.offers;
      const percentageMatched = Math.ceil(matchedOffers / offeredCount * 100);

      return `${Units.contractNumber(matchedOffers)}/${Units.contractNumber(offeredCount)} (${percentageMatched}%)`;
    },
    sortable: true
  }
];

const RecentOffersSummary = ({data}) => {
  return (
    <Table className="table table-simple table-break-word flush-bottom"
      columns={columns}
      data={data} />
  );
};

module.exports = RecentOffersSummary;
