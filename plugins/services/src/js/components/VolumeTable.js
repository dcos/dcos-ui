import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';
import {Table} from 'reactjs-components';

import Volume from '../structs/Volume';
import VolumeStatus from '../constants/VolumeStatus';

const METHODS_TO_BIND = ['renderIDColumn'];

class VolumeTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getData(volumes) {
    return volumes.map(function (volume) {
      return {
        id: volume.getId(),
        host: volume.getHost(),
        type: volume.getType(),
        path: volume.getContainerPath(),
        size: volume.getSize(),
        mode: volume.getMode(),
        status: volume.getStatus()
      };
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '30%'}} />
        <col style={{width: '10%'}} />
        <col style={{width: '10%'}} />
        <col style={{width: '10%'}} />
        <col style={{width: '10%'}} />
        <col style={{width: '5%'}} />
        <col style={{width: '10%'}} />
      </colgroup>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames({
      'active': prop === sortBy.prop,
      'clickable': row == null
    });
  }

  getColumnHeading(prop, order, sortBy) {
    let caretClassNames = classNames(
      'caret',
      {
        [`caret--${order}`]: order != null,
        'caret--visible': prop === sortBy.prop
      }
    );

    let headingStrings = {
      id: 'ID',
      host: 'HOST',
      type: 'TYPE',
      path: 'PATH',
      size: 'SIZE',
      mode: 'MODE',
      status: 'STATUS'
    };

    return (
      <span>
        {headingStrings[prop]}
        <span className={caretClassNames}></span>
      </span>
    );
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'id',
        render: this.renderIDColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'host',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'type',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'path',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'size',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'mode',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'status',
        render: this.renderStatusColumn,
        sortable: true
      }
    ];
  }

  renderIDColumn(prop, row) {
    let id = row[prop];
    let {nodeID, taskID} = this.props.params;
    let volumeID = global.encodeURIComponent(id);
    let routes = this.props.routes;
    let currentroutePath = routes[routes.length - 1].path;
    let routePath = null;

    if (currentroutePath === '/services/overview/:id') {
      routePath = `/services/overview/${this.props.params.id}/volumes/${volumeID}`;
    } else if (currentroutePath === '/services/overview/:id/tasks/:taskID/volumes') {
      routePath = `/services/overview/${this.props.params.id}/tasks/${taskID}/volumes/${volumeID}`;
    } else if (currentroutePath === '/nodes/:nodeID/tasks/:taskID/volumes') {
      routePath = `/nodes/${nodeID}/tasks/${taskID}/volumes/${volumeID}`;
    }

    return <Link to={routePath}>{id}</Link>;
  }

  renderStatusColumn(prop, row) {
    let value = row[prop];
    let classes = classNames({
      'text-danger': value === VolumeStatus.DETACHED,
      'text-success': value === VolumeStatus.ATTACHED
    });

    return (
      <span className={classes}>
        {row[prop]}
      </span>
    );
  }

  render() {
    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getData(this.props.service.getVolumes().getItems())}
        sortBy={{ prop: 'id', order: 'asc' }} />
    );
  }

}

VolumeTable.propTypes = {
  volumes: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Volume)),
  params: React.PropTypes.object.isRequired,
  routes: React.PropTypes.array.isRequired
};

VolumeTable.contextTypes = {
  router: React.PropTypes.object
};

module.exports = VolumeTable;
