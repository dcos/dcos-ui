import classNames from 'classnames';
import React from 'react';
import {Link} from 'react-router';

import DCOSStore from '../stores/DCOSStore';

class ServicesBreadcrumb extends React.Component {
  constructor() {
    super();
  }

  render() {
    const {serviceTreeItem, taskID} = this.props;
    const groupId = serviceTreeItem.getId();
    const breadcrumbIcon = (
      <i className="icon
        icon-sprite
        icon-sprite-small
        icon-sprite-small-white
        icon-back
        forward" />
    );

    let breadcrumbNodes = [(
      <span className="crumb" key="/">
        <Link to="services-page">Services</Link>
      </span>
    )];

    if (groupId === '/') {
      breadcrumbNodes[0] = (
        <span className="crumb" key="/">Services</span>
      );
    }

    breadcrumbNodes = breadcrumbNodes.concat(
      DCOSStore.serviceTree.reduceItems(function (memo, item) {
        const id = item.getId();
        if (groupId.startsWith(id)) {
          const name = item.getName();

          let breadCrumbNode = (
            <Link
              to="services-detail"
              params={{id: encodeURIComponent(id)}}
              title={name}>
              {name}
            </Link>
          );

          if (id === groupId && taskID == null) {
            breadCrumbNode = (
              <span>{name}</span>
            );
          }

          memo.push(
            <span className="crumb" key={id}>
              {breadcrumbIcon}
              {breadCrumbNode}
            </span>
          );
        }

        return memo;
      }, [])
    );

    if (taskID != null) {
      breadcrumbNodes.push(
        <span className="crumb" key={taskID}>
          {breadcrumbIcon}
          <span>{taskID}</span>
        </span>
      );
    }

    const classSet = classNames('flex-box control-group', this.props.className);
    const headerClassSet = classNames(
      'breadcrumbs flush-top inverse',
      this.props.headerClassNames
    );

    return (
      <div className={classSet}>
        <h4 className={headerClassSet}>
          {breadcrumbNodes}
        </h4>
      </div>
    );
  }
}

ServicesBreadcrumb.propTypes = {
  className: React.PropTypes.string,
  headerClassName: React.PropTypes.string,
  serviceTreeItem: React.PropTypes.object.isRequired,
  taskID: React.PropTypes.string
};

module.exports = ServicesBreadcrumb;
