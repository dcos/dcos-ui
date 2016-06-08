import {Link} from 'react-router';
import React from 'react';
import {Table} from 'reactjs-components';

import JobTableHeaderLabels from '../../constants/JobTableHeaderLables';
import ResourceTableUtil from '../../utils/ResourceTableUtil';
import ServiceTableUtil from '../../utils/ServiceTableUtil';
import TableUtil from '../../utils/TableUtil';
import Tree from '../../structs/Tree';

const METHODS_TO_BIND = [
  'renderHeadline'
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
