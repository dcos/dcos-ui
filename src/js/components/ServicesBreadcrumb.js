import React from 'react';
import {Link} from 'react-router';

import DCOSStore from '../stores/DCOSStore';

class ServicesBreadcrumb extends React.Component {
  constructor() {
    super();
  }

  render() {
    const {serviceTreeItem} = this.props;
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
        <Link to="services">Services</Link>
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

          if (id === groupId) {
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

    return (
      <div className="flex-box control-group">
        <h4 className="breadcrumbs flush-top inverse">
          {breadcrumbNodes}
        </h4>
      </div>
    );
  }
}

ServicesBreadcrumb.propTypes = {
  serviceTreeItem: React.PropTypes.object
};

module.exports = ServicesBreadcrumb;
