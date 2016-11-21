import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';
import {Table} from 'reactjs-components';

import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';
import DateUtil from '../../../../../src/js/utils/DateUtil';
import Icon from '../../../../../src/js/components/Icon';
import MesosStateStore from '../../../../../src/js/stores/MesosStateStore';
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

    const {unmatchedResource = []} = item;

    if (unmatchedResource.includes(resource)) {
      return 1;
    }

    return 0;
  };
};

const getMatchedOfferRenderFn = (resource) => {
  return (prop, row) => {
    const {unmatchedResource = []} = row;
    let icon = null;

    if (unmatchedResource.includes(resource)) {
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
    <col style={{width: '10%'}} />
    <col className="hidden-small-down" />
  </colgroup>
);

const columns = [
  {
    heading: getColumnHeadingFn('Host'),
    prop: 'hostname',
    className: getColumnClassNameFn(),
    render: (prop, row) => {
      const hostname = row[prop];
      const node = MesosStateStore.getNodeFromHostname(hostname);

      return (
        <Link className="table-cell-link-primary" to={`/nodes/${node.id}`}>
          {hostname}
        </Link>
      );
    },
    sortable: true
  },
  {
    heading: getColumnHeadingFn('Role', 'RLE'),
    prop: 'role',
    className: getColumnClassNameFn('text-align-center'),
    render: getMatchedOfferRenderFn(DeclinedOffersReasons.UNFULFILLED_ROLE),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.UNFULFILLED_ROLE)
    )
  },
  {
    heading: getColumnHeadingFn('Constraint', 'CSTR'),
    prop: 'constraint',
    className: getColumnClassNameFn('text-align-center'),
    render:
      getMatchedOfferRenderFn(DeclinedOffersReasons.UNFULFILLED_CONSTRAINT),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.UNFULFILLED_CONSTRAINT)
    )
  },
  {
    heading: getColumnHeadingFn('CPU/MEM/DSK'),
    prop: 'cpu',
    className: getColumnClassNameFn('text-align-center hidden-large-up'),
    render: (prop, row) => {
      return (
        <div className="flex flex-justify-items-space-around">
          {getMatchedOfferRenderFn(
              DeclinedOffersReasons.INSUFFICIENT_CPU
            )(prop, row)}
          {getMatchedOfferRenderFn(
              DeclinedOffersReasons.INSUFFICIENT_MEM
            )(prop, row)}
          {getMatchedOfferRenderFn(
              DeclinedOffersReasons.INSUFFICIENT_DISK
            )(prop, row)}
        </div>
      );
    },
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_CPU)
    )
  },
  {
    heading: getColumnHeadingFn('CPU'),
    prop: 'cpu',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_CPU),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_CPU)
    )
  },
  {
    heading: getColumnHeadingFn('Mem'),
    prop: 'mem',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_MEM),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_MEM)
    )
  },
  {
    heading: getColumnHeadingFn('Disk', 'DSK'),
    prop: 'disk',
    className: getColumnClassNameFn('text-align-center hidden-medium-down'),
    render: getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_DISK),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_DISK)
    )
  },
  {
    heading: getColumnHeadingFn('Port', 'PRT'),
    prop: 'port',
    className: getColumnClassNameFn('text-align-center'),
    render: getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_PORTS),
    sortable: true,
    sortFunction: TableUtil.getSortFunction(
      'timestamp',
      getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_PORTS)
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
