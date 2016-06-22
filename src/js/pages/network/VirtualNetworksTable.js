import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';
import {Table} from 'reactjs-components';

import OverlayList from '../../structs/OverlayList';

const headerMapping = {
  name: 'VIRTUAL NETWORK NAME',
  subnet: 'SUBNET',
  prefix: 'AGENT PREFIX LENGTH'
};

class VirtualNetworksTable extends React.Component {
  getClassName(prop, sortBy) {
    return classNames({
      'highlight': prop === sortBy.prop
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = this.renderHeading;

    return [
      {
        className: getClassName,
        getValue: function (overlay) {
          return overlay.getName();
        },
        headerClassName: getClassName,
        heading,
        prop: 'name',
        render: this.renderName,
        sortable: false
      },
      {
        className: getClassName,
        getValue: function (overlay) {
          return overlay.getSubnet();
        },
        headerClassName: getClassName,
        heading,
        prop: 'subnet',
        sortable: false
      },
      {
        className: getClassName,
        getValue: function (overlay) {
          return overlay.getPrefix();
        },
        headerClassName: getClassName,
        heading,
        prop: 'prefix',
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
    return (
      <span className="table-header-title">{headerMapping[prop]}</span>
    );
  }

  renderName(prop, overlay) {
    let overlayName = overlay.getName();

    return (
      <Link
        className="clickable"
        params={{overlayName}}
        title={overlayName}
        to="virtual-networks-tab-detail">
        {overlayName}
      </Link>
    );
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '30%'}} />
        <col />
        <col />
      </colgroup>
    );
  }

  render() {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.overlays.getItems()} />
    );
  }
}

VirtualNetworksTable.contextTypes = {
  router: React.PropTypes.func
};

VirtualNetworksTable.propTypes = {
  overlays: React.PropTypes.instanceOf(OverlayList)
}

module.exports = VirtualNetworksTable;
