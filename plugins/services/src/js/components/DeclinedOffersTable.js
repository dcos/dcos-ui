import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';
import {Table, Tooltip} from 'reactjs-components';

import DeclinedOffersReasons from '../constants/DeclinedOffersReasons';
import DateUtil from '../../../../../src/js/utils/DateUtil';
import Icon from '../../../../../src/js/components/Icon';
import MesosStateStore from '../../../../../src/js/stores/MesosStateStore';
import TableUtil from '../../../../../src/js/utils/TableUtil';
import TimeAgo from '../../../../../src/js/components/TimeAgo';
import Units from '../../../../../src/js/utils/Units';

class RejectedOffersTable extends React.Component {
  getColumnClassNameFn(classes) {
    return (prop, sortBy) => {
      return classNames(classes, {
        'active': prop === sortBy.prop
      });
    };
  }

  getColumnHeadingFn(defaultHeading, abbreviation) {
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
  }

  getMatchedResourcesSortFn(resource) {
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
  }

  getMatchedOfferRenderFn(resource) {
    const {summary} = this.props;

    return (prop, row) => {
      const {unmatchedResource = []} = row;
      const isOfferDeclined = unmatchedResource.includes(resource);
      const receivedResourceClasses = classNames({
        'text-danger': isOfferDeclined
      });

      let receivedResource = row.offered[prop] || 'N/A';
      if (Array.isArray(receivedResource)) {
        receivedResource = receivedResource.join(', ') || 'N/A';
      } else if (['cpus', 'mem', 'disk'].includes(prop)) {
        receivedResource = Units.formatResource(prop, receivedResource);
      }

      let icon = null;
      if (isOfferDeclined) {
        icon = <Icon color="red" family="mini" id="close" size="mini" />;
      } else {
        icon = <Icon color="neutral" family="mini" id="check" size="mini" />;
      }

      const tooltipContent = (
        <div>
          <div className="">
            <strong>Requested</strong>{': '}
            {summary[prop].requested}
          </div>
          <div className="">
            <strong>Received</strong>{': '}
            <span className={receivedResourceClasses}>{receivedResource}</span>
          </div>
        </div>
      );

      return (
        <Tooltip content={tooltipContent}
          maxWidth={300}
          wrapText={true}>
          {icon}
        </Tooltip>
      );
    };
  }

  getColGroup() {
    return (
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
  }

  getColumns() {
    return [
      {
        heading: this.getColumnHeadingFn('Host'),
        prop: 'hostname',
        className: this.getColumnClassNameFn(),
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
        heading: this.getColumnHeadingFn('Role', 'RLE'),
        prop: 'roles',
        className: this.getColumnClassNameFn('text-align-center'),
        render: this.getMatchedOfferRenderFn(DeclinedOffersReasons.UNFULFILLED_ROLE),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.UNFULFILLED_ROLE)
        )
      },
      {
        heading: this.getColumnHeadingFn('Constraint', 'CSTR'),
        prop: 'constraints',
        className: this.getColumnClassNameFn('text-align-center'),
        render:
          this.getMatchedOfferRenderFn(DeclinedOffersReasons.UNFULFILLED_CONSTRAINT),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.UNFULFILLED_CONSTRAINT)
        )
      },
      {
        heading: this.getColumnHeadingFn('CPU/MEM/DSK'),
        prop: 'cpus',
        className: this.getColumnClassNameFn('text-align-center hidden-large-up'),
        render: (prop, row) => {
          return (
            <div className="flex flex-justify-items-space-around">
              {this.getMatchedOfferRenderFn(
                  DeclinedOffersReasons.INSUFFICIENT_CPU
                )(prop, row)}
              {this.getMatchedOfferRenderFn(
                  DeclinedOffersReasons.INSUFFICIENT_MEM
                )(prop, row)}
              {this.getMatchedOfferRenderFn(
                  DeclinedOffersReasons.INSUFFICIENT_DISK
                )(prop, row)}
            </div>
          );
        },
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_CPU)
        )
      },
      {
        heading: this.getColumnHeadingFn('CPU'),
        prop: 'cpus',
        className: this.getColumnClassNameFn('text-align-center hidden-medium-down'),
        render: this.getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_CPU),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_CPU)
        )
      },
      {
        heading: this.getColumnHeadingFn('Mem'),
        prop: 'mem',
        className: this.getColumnClassNameFn('text-align-center hidden-medium-down'),
        render: this.getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_MEM),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_MEM)
        )
      },
      {
        heading: this.getColumnHeadingFn('Disk', 'DSK'),
        prop: 'disk',
        className: this.getColumnClassNameFn('text-align-center hidden-medium-down'),
        render: this.getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_DISK),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_DISK)
        )
      },
      {
        heading: this.getColumnHeadingFn('Port', 'PRT'),
        prop: 'ports',
        className: this.getColumnClassNameFn('text-align-center'),
        render: this.getMatchedOfferRenderFn(DeclinedOffersReasons.INSUFFICIENT_PORTS),
        sortable: true,
        sortFunction: TableUtil.getSortFunction(
          'timestamp',
          this.getMatchedResourcesSortFn(DeclinedOffersReasons.INSUFFICIENT_PORTS)
        )
      },
      {
        heading: this.getColumnHeadingFn('Received'),
        prop: 'timestamp',
        className: this.getColumnClassNameFn('text-align-right hidden-small-down'),
        render: (prop, row) => <TimeAgo time={DateUtil.strToMs(row[prop])} />,
        sortable: true
      }
    ];
  }

  render() {
    const {offers} = this.props;

    return (
      <Table className="table table-simple table-header-nowrap table-break-word flush-bottom"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        data={offers}
        sortBy={{prop: 'timestamp', order: 'desc'}} />
    );
  }
}

module.exports = RejectedOffersTable;
