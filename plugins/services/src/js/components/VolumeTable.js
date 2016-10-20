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
    let params = {volumeID: global.encodeURIComponent(id)};
    let routes = this.context.router.getCurrentRoutes();
    let currentRoutePath = routes[routes.length - 1].path;
    let routePath = null;

    if (currentRoutePath === '/services/overview/:id') {
      routePath = '/services/overview/:id/volumes/:volumeID';
      params.id = this.props.params.id;
    } else if (currentRoutePath === '/services/overview/:id/tasks/:taskID/volumes') {
      routePath = '/services/overview/:id/tasks/:taskID/volumes/:volumeID';
      params.id = this.props.params.id;
      params.taskID = this.props.params.taskID;
    } else if (currentRoutePath === '/nodes/:nodeID/tasks/:taskID/volumes') {
      routePath = '/nodes/:nodeID/tasks/:taskID/volumes/:volumeID';
      params.nodeID = this.props.params.nodeID;
      params.taskID = this.props.params.taskID;
    }

    return <Link to={routePath} params={params}>{id}</Link>;
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
  volumes: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Volume))
};

VolumeTable.contextTypes = {
  router: React.PropTypes.func
};

module.exports = VolumeTable;
