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
      <i className="icon icon-sprite icon-sprite-small icon-back forward" />
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
        if (groupId.startsWith(item.getId())) {
          const id = item.getId();
          const name = item.getName();

          let linkOrText = (
            <Link
              to="services-detail"
              params={{id: encodeURIComponent(id)}}
              title={name}>
              {name}
            </Link>
          );

          if (id === groupId) {
            linkOrText = (
              <span>{name}</span>
            );
          }

          memo.push(
            <span className="crumb" key={id}>
              {breadcrumbIcon}
              {linkOrText}
            </span>
          );
        }

        return memo;
      }, [])
    );

    return (
      <div className="flex-box control-group">
        <h3 className="breadcrumb flush-top">
          {breadcrumbNodes}
        </h3>
      </div>
    );
  }
}

ServicesBreadcrumb.propTypes = {
  serviceTreeItem: React.PropTypes.object
};

module.exports = ServicesBreadcrumb;
