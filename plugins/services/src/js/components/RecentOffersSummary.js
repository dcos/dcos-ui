import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import Units from '../../../../../src/js/utils/Units';

const displayedResourceValues = {
  role: 'Role',
  constraint: 'Constraint',
  cpu: 'CPU',
  mem: 'Mem',
  disk: 'Disk',
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

const colGroup = (
  <colgroup>
    <col style={{width: '40%'}} />
    <col style={{width: '30%'}} />
    <col style={{width: '30%'}} />
  </colgroup>
);

const columns = [
  {
    heading: getColumnHeadingFn('Resource'),
    prop: 'resource',
    render: (prop, row) => {
      let resource = row[prop];

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

      // Constraints are nested arrays, so we return them as follows:
      // [[a, b, c], [d, e]] displays a:b:c, d:e
      if (row.resource === 'constraint') {
        return requestedResource.map((constraint) => {
          return constraint.join(':');
        }).join(', ');
      }

      if (row.resource === 'cpu') {
        return Units.formatResource('cpus', requestedResource);
      }

      if (row.resource === 'mem') {
        return Units.formatResource('mem', requestedResource);
      }

      if (row.resource === 'disk') {
        return Units.formatResource('disk', requestedResource);
      }

      if (Array.isArray(requestedResource)) {
        return requestedResource.join(', ');
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
      let percentageMatched = null;

      // Avoid NaN and inifinite values from division by zero.
      if (offeredCount === 0) {
        percentageMatched = 0;
      } else {
        percentageMatched = Math.ceil(matchedOffers / offeredCount * 100);
      }

      return (
        <span>
          {Units.contractNumber(matchedOffers)}/{Units.contractNumber(offeredCount)}
          {` (${percentageMatched}%)`}
        </span>
      );
    },
    sortable: true
  }
];

const RecentOffersSummary = ({data}) => {
  const tableRows = ['role', 'constraint', 'cpu', 'mem', 'disk', 'ports'];
  const summaryData = tableRows.map((resource) => {
    return {
      resource,
      requested: data[resource].requested,
      offers: data[resource].offers,
      matched: data[resource].matched
    };
  });

  return (
    <Table className="table table-simple table-break-word flush-bottom"
      colGroup={colGroup}
      columns={columns}
      data={summaryData} />
  );
};

module.exports = RecentOffersSummary;
