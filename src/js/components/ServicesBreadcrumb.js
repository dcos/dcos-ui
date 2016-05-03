import React from 'react';
import {Link} from 'react-router';

import ServicesPathUtil from '../utils/ServicesPathUtil';

const breadcrumbIcon = (
  <i className="icon icon-sprite icon-sprite-small icon-back forward" />
);

var ServicesBreadcrumb = React.createClass({
  displayName: 'ServicesBreadcrumb',

  propTypes: {
    appId: React.PropTypes.string,
    groupId: React.PropTypes.string,
    taskId: React.PropTypes.string,
    volumeId: React.PropTypes.string
  },

  getRootLink: function () {
    const {groupId, appId} = this.props;

    if (groupId == null ||
      (groupId === '/' && appId == null)) {
      return (
        <span className="crumb">Services</span>
      );
    }

    return (
      <span className="crumb">
        <Link to="services">Services</Link>
      </span>
    );
  },

  getGroupLinks: function () {
    var {appId, groupId} = this.props;

    if (groupId == null) {
      return null;
    }

    const pathParts = groupId.split('/').slice(0, -1);

    return pathParts.map((name, i) => {
      var id = pathParts.slice(0, i + 1).join('/');

      let group = (
          <Link
            to="services-detail"
            params={{id: encodeURIComponent(id)}}
            title={name}>
            {name}
          </Link>
      );

      if (i === pathParts.length - 1 && appId == null) {
        group = (<span>{name}</span>);
      }

      return (
        <span className="crumb" key={id}>
          {breadcrumbIcon}
          {group}
        </span>
      );
    }).slice(1);
  },

  getAppLink: function () {
    var appId = this.props.appId;
    var groupId = this.props.groupId;

    if (appId == null || groupId == null) {
      return null;
    }

    const name = ServicesPathUtil.getRelativePath(appId, groupId);

    if (appId.startsWith(groupId)) {
      return (
        <span className="crumb">
          {breadcrumbIcon}
          {name}
        </span>
      );
    }

    return (
      <span className="crumb">
        {breadcrumbIcon}
        <Link to="services-detail" params={{id: encodeURIComponent(appId)}}>
          {name}
        </Link>
      </span>
    );
  },

  render: function () {
    return (
      <div className="flex-box control-group">
        <h3 className="breadcrumb flush-top">
          {this.getRootLink()}
          {this.getGroupLinks()}
          {this.getAppLink()}
        </h3>
      </div>
    );
  }
});

export default ServicesBreadcrumb;
