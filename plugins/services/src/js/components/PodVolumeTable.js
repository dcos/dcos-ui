import classNames from "classnames";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";

import { reconstructPathFromRoutes } from "#SRC/js/utils/RouterUtil";
import Volume from "../structs/Volume";
import VolumeStatus from "../constants/VolumeStatus";
import VolumeDefinitions from "../constants/VolumeDefinitions";

const METHODS_TO_BIND = ["renderIDColumn"];

class PodVolumeTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getData(volumes) {
    return volumes.map(function(volume) {
      return {
        id: volume.getId(),
        host: volume.getHost(),
        type: volume.getType(),
        profile: volume.getProfile(),
        name: volume.getContainerPath(),
        size: volume.getSize(),
        status: volume.getStatus()
      };
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "30%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "10%" }} />
      </colgroup>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames({
      active: prop === sortBy.prop,
      clickable: row == null,
      "text-overflow": prop === "profile"
    });
  }

  getColumnHeading(prop, order, sortBy) {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop
    });

    const headingStrings = {
      id: "ID",
      host: "Host",
      type: "Volume Type",
      profile: "Volume Profile",
      name: "Volume Name",
      size: "Size",
      status: "Status"
    };

    return (
      <span>
        {headingStrings[prop]}
        <span className={caretClassNames} />
      </span>
    );
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "id",
        render: this.renderIDColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "host",
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "type",
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "profile",
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "name",
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "size",
        render: this.renderSizeColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "status",
        render: this.renderStatusColumn,
        sortable: true
      }
    ];
  }

  renderIDColumn(prop, row) {
    const id = row[prop];
    const { nodeID, taskID } = this.props.params;
    const volumeID = encodeURIComponent(id);
    const serviceID = encodeURIComponent(this.props.params.id);
    const currentroutePath = reconstructPathFromRoutes(this.props.routes);
    let routePath = null;

    if (currentroutePath === "/services/detail/:id/podvolumes") {
      routePath = `/services/detail/${serviceID}/podvolumes/${volumeID}`;
    } else if (
      currentroutePath === "/services/detail/:id/tasks/:taskID/podvolumes"
    ) {
      routePath = `/services/detail/${serviceID}/tasks/${taskID}/podvolumes/${volumeID}`;
    } else if (currentroutePath === "/nodes/:nodeID/tasks/:taskID/podvolumes") {
      routePath = `/nodes/${nodeID}/tasks/${taskID}/podvolumes/${volumeID}`;
    }

    return (
      <Link className="table-cell-link-primary" to={routePath}>
        {id}
      </Link>
    );
  }

  renderSizeColumn(prop, row) {
    const { size } = row;
    let unit = "MiB";

    if (
      row.type !== VolumeDefinitions.PERSISTENT.type &&
      row.type !== VolumeDefinitions.DSS.type
    ) {
      unit = "GiB";
    }

    return <span>{`${size} ${unit}`}</span>;
  }

  renderStatusColumn(prop, row) {
    const value = row[prop];
    const classes = classNames({
      "text-danger": value === VolumeStatus.DETACHED,
      "text-success": value === VolumeStatus.ATTACHED
    });

    return <span className={classes}>{row[prop]}</span>;
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getData(this.props.service.getVolumesData().getItems())}
        sortBy={{ prop: "id", order: "asc" }}
      />
    );
  }
}

PodVolumeTable.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.instanceOf(Volume)),
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired
};

export default PodVolumeTable;
