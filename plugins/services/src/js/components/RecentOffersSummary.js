import classNames from 'classnames';
import React from 'react';
import {Table, Tooltip} from 'reactjs-components';

import Icon from '../../../../../src/js/components/Icon';
import Units from '../../../../../src/js/utils/Units';

const displayedResourceValues = {
  roles: 'Role',
  constraints: 'Constraints',
  cpus: 'CPU',
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
    <col className="table-column-tooltip" />
    <col />
    <col />
    <col />
  </colgroup>
);

const columns = [
  {
    heading: '',
    prop: 'resource',
    render: (prop, row) => {
      const resource = row[prop];
      let tooltipContent = null;

      // TODO: Implement actual tooltip content.
      // https://mesosphere.atlassian.net/browse/DCOS-11708
      if (resource === 'roles') {
        tooltipContent = 'Describe roles...';
      }

      if (resource === 'constraints') {
        tooltipContent = 'Describe constraints...';
      }

      if (resource === 'cpus') {
        tooltipContent = 'Describe CPU...';
      }

      if (resource === 'mem') {
        tooltipContent = 'Describe memory...';
      }

      if (resource === 'disk') {
        tooltipContent = 'Describe disk...';
      }

      if (resource === 'ports') {
        tooltipContent = 'Describe ports...';
      }

      if (tooltipContent != null) {
        return (
          <Tooltip content={tooltipContent}>
            <Icon
              id="ring-information"
              size="mini"
              family="mini"
              color="grey" />
          </Tooltip>
        );
      }
    },
    className: getColumnClassNameFn('table-column-tooltip'),
    sortable: false
  },
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
  const tableRows = ['roles', 'constraints', 'cpus', 'mem', 'disk', 'ports'];
  const summaryData = tableRows.map((resource) => {
    return {
      resource,
      requested: data[resource].requested,
      offers: data[resource].offers,
      matched: data[resource].matched
    };
  });

  return (
    <Table className="table table-simple table-break-word table-fixed-layout flush-bottom"
      colGroup={colGroup}
      columns={columns}
      data={summaryData} />
  );
};

module.exports = RecentOffersSummary;
