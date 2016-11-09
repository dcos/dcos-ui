import classNames from 'classnames';
import React from 'react';
import {Table} from 'reactjs-components';

import DateUtil from '../../../../../src/js/utils/DateUtil';
import Icon from '../../../../../src/js/components/Icon';
import TableUtil from '../../../../../src/js/utils/TableUtil';

const getColumnClassNameFn = (classes) => {
  return (prop, sortBy) => {
    return classNames(classes, {
      'active': prop === sortBy.prop
    });
  };
};

const getColumnHeadingFn = (defaultHeading, abbreviation) => {
  return (prop, order, sortBy) => {
    let caretClassNames = classNames('caret', {
      [`caret--${order}`]: order != null,
      'caret--visible': sortBy.prop === prop
    });

    let columnHeading = defaultHeading || prop;

    if (abbreviation != null) {
      columnHeading = [
        <span className="hidden-medium-down" key="full-text">
          {columnHeading}
        </span>,
        <span className="hidden-large-up" key="abbreviation">
          {abbreviation}
        </span>
      ];
    }

    return (
      <span>
        {columnHeading}
        <span className={caretClassNames} />
      </span>
    );
  };
};

const getMatchedResourcesSortFn = (resource) => {
  return (item, prop) => {
    // It's possible that prop is one of the resources, or timestamp for a
    // tiebreaker. Return the timestamp in ms if it's the current prop.
    if (prop === 'timestamp') {
      return DateUtil.strToMs(item[prop]);
    }

    const {unmatchedResources = []} = item;

    if (unmatchedResources.includes(resource)) {
      return 1;
    }

    return 0;
  };
};

const getMatchedOfferRenderFn = (resource) => {
  return (prop, row) => {
    const {unmatchedResources = []} = row;
    let icon = null;

    if (unmatchedResources.includes(resource)) {
      icon = <Icon color="red" family="mini" id="close" size="mini" />;
    } else {
      icon = <Icon color="neutral" family="mini" id="check" size="mini" />;
    }

    return icon;
  };
};

const colGroup = (
  <colgroup>
    <col />
    <col style={{width: '10%'}} />
    <col style={{width: '10%'}} />
    <col className="hidden-large-up" style={{width: '30%'}} />
    <col className="hidden-medium-down" style={{width: '10%'}} />
    <col className="hidden-medium-down" style={{width: '10%'}} />
    <col className="hidden-medium-down" style={{width: '10%'}} />
    <col className="hidden-medium-down" style={{width: '10%'}} />
    <col style={{width: '10%'}} />
    <col className="hidden-small-down" />
  </colgroup>
);

const columns = [
  {
    heading: getColumnHeadingFn('Host'),
    prop: 'hostname',
    className: getColumnClassNameFn(),
    sortable: true
  },
  {
    heading: getColumnHeadingFn('Role', 'RLE'),
    prop: 'role',
    className: getColumnClassNameFn('text-align-center'),
    render: getMatchedOfferRenderFn('role'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('role')
    )
  },
  {
    heading: getColumnHeadingFn('Constraint', 'CSTR'),
    prop: 'constraint',
    className: getColumnClassNameFn('text-align-center'),
    render: getMatchedOfferRenderFn('constraint'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('constraint')
    )
  },
  {
    heading: getColumnHeadingFn('CPU/MEM/DSK/GPU'),
    prop: 'cpu',
    className: getColumnClassNameFn('text-align-center hidden-large-up'),
    render: (prop, row) => {
      return (
        <div className="flex flex-justify-items-space-around">
          {getMatchedOfferRenderFn('cpu')(prop, row)}
          {getMatchedOfferRenderFn('mem')(prop, row)}
          {getMatchedOfferRenderFn('disk')(prop, row)}
          {getMatchedOfferRenderFn('gpus')(prop, row)}
        </div>
      );
    },
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('cpu')
    )
  },
  {
    heading: getColumnHeadingFn('CPU'),
    prop: 'cpu',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn('cpu'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('cpu')
    )
  },
  {
    heading: getColumnHeadingFn('Mem'),
    prop: 'mem',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn('mem'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('mem')
    )
  },
  {
    heading: getColumnHeadingFn('Disk', 'DSK'),
    prop: 'disk',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn('disk'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('disk')
    )
  },
  {
    heading: getColumnHeadingFn('GPU'),
    prop: 'gpus',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn('gpus'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('gpus')
    )
  },
  {
    heading: getColumnHeadingFn('Port', 'PRT'),
    prop: 'port',
    className: getColumnClassNameFn('text-align-center'),
    render: getMatchedOfferRenderFn('port'),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp', getMatchedResourcesSortFn('port')
    )
  },
  {
    heading: getColumnHeadingFn('Received'),
    prop: 'timestamp',
    className: getColumnClassNameFn('text-align-right hidden-small-down'),
    render: (prop, row) => DateUtil.msToDateStr(DateUtil.strToMs(row[prop])),
    sortable: true
  }
];

const RejectedOffersTable = ({data}) => {
  return (
    <Table className="table table-simple table-header-nowrap table-break-word flush-bottom"
      colGroup={colGroup}
      columns={columns}
      data={data} />
  );
};

module.exports = RejectedOffersTable;
