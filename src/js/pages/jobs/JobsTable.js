import {Link} from 'react-router';
import React from 'react';
import {Table} from 'reactjs-components';

import JobTableHeaderLabels from '../../constants/JobTableHeaderLables';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import ServiceTableUtil from '../../utils/ServiceTableUtil';
import TableUtil from '../../utils/TableUtil';
import Tree from '../../structs/Tree';

const StatusMapping = {
  'Completed': 'text-mute',
  'Running': 'text-success',
  'Scheduled': 'text-mute',
  'Unscheduled': 'text-mute'
};

const METHODS_TO_BIND = [
  'renderHeadline',
  'renderStatus',
  'renderLastRunStatus'
];

class JobsTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    }, this);
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '25%'}} />
        <col />
        <col style={{width: '25%'}} />
      </colgroup>
    );
  }

  getColumns() {
    let className = ResourceTableUtil.getClassName;
    let heading = ResourceTableUtil.renderHeading(JobTableHeaderLabels);

    return [
      {
        className,
        headerClassName: className,
        prop: 'name',
        render: this.renderHeadline,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'status',
        render: this.renderStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className,
        headerClassName: className,
        prop: 'lastRunStatus',
        render: this.renderLastRunStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading: 'Last Run'
      }
    ];
  }

  renderHeadline(prop, job) {
    const id = encodeURIComponent(job.getId());
    let itemImage = null;

    if (job instanceof Tree) {
      itemImage = (
        <span
          className="icon icon-small icon-image-container icon-app-container">
          <i className="icon icon-sprite icon-sprite-mini icon-directory "/>
        </span>
      );
    }

    return (
      <div className="job-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to="jobs-detail"
          className="table-cell-icon"
          params={{id}}>
          {itemImage}
        </Link>
        <Link to="jobs-detail"
          className="headline table-cell-value flex-box flex-box-col"
          params={{id}}>
          <span className="text-overflow">
            {job.getName()}
          </span>
        </Link>
      </div>
    );
  }

  renderStatus(prop, job) {
    if (job instanceof Tree) {
      return null;
    }

    let jobStatus = job.getStatus();
    let jobStatusClassSet = StatusMapping[jobStatus] || '';

    return (
      <div className="status-bar-wrapper media-object media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
        <span className="media-object-item flush-bottom visible-large-inline-block">
          <span className={jobStatusClassSet}>{jobStatus}</span>
        </span>
      </div>
    );
  }

  renderLastRunStatus(prop, job) {
    if (job instanceof Tree) {
      return null;
    }

    let className = 'text-mute';
    let lastRunStatus = job.lastRunStatus || 'n/a';

    if (lastRunStatus === 'Failed') {
      className = 'text-danger';
    }

    if (lastRunStatus === 'Successful') {
      className = 'text-success';
    }

    return (
      <span className={className}>
        {lastRunStatus}
      </span>
    );
  }

  render() {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        data={this.props.jobs.slice()}
        itemHeight={TableUtil.getRowHeight()}
        containerSelector=".gm-scroll-view"
        sortBy={{prop: 'name', order: 'asc'}} />
    );
  }
}

JobsTable.propTypes = {
  jobs: React.PropTypes.array.isRequired
};

module.exports = JobsTable;
