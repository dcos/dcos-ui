import classNames from "classnames";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";
import { Trans } from "@lingui/macro";

import { reconstructPathFromRoutes } from "#SRC/js/utils/RouterUtil";
import Volume from "../structs/Volume";
import VolumeStatus from "../constants/VolumeStatus";

const METHODS_TO_BIND = ["renderIDColumn"];

class VolumeTable extends React.Component {
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
        path: volume.getContainerPath(),
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
      id: <Trans render="span">ID</Trans>,
      host: <Trans render="span">Host</Trans>,
      type: <Trans render="span">Volume Type</Trans>,
      profile: <Trans render="span">Volume Profile</Trans>,
      path: <Trans render="span">Path</Trans>,
      size: <Trans render="span">Size</Trans>,
      status: <Trans render="span">Status</Trans>
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
        prop: "path",
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "size",
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

    if (currentroutePath === "/services/detail/:id/volumes") {
      routePath = `/services/detail/${serviceID}/volumes/${volumeID}`;
    } else if (
      currentroutePath === "/services/detail/:id/tasks/:taskID/volumes"
    ) {
      routePath = `/services/detail/${serviceID}/tasks/${taskID}/volumes/${volumeID}`;
    } else if (currentroutePath === "/nodes/:nodeID/tasks/:taskID/volumes") {
      routePath = `/nodes/${nodeID}/tasks/${taskID}/volumes/${volumeID}`;
    }

    return (
      <Link className="table-cell-link-primary" to={routePath}>
        {id}
      </Link>
    );
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
        data={this.getData(this.props.service.getVolumes().getItems())}
        sortBy={{ prop: "id", order: "asc" }}
      />
    );
  }
}

VolumeTable.propTypes = {
  volumes: PropTypes.arrayOf(PropTypes.instanceOf(Volume)),
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired
};

export default VolumeTable;
