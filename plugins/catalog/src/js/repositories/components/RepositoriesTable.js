import classNames from "classnames";
import { Table } from "reactjs-components";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import CollapsingString from "#SRC/js/components/CollapsingString";

import List from "#SRC/js/structs/List";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import RepositoriesTableHeaderLabels
  from "#SRC/js/constants/RepositoriesTableHeaderLabels";
import StringUtil from "#SRC/js/utils/StringUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import UserActions from "#SRC/js/constants/UserActions";
import RepositoriesDelete from "../RepositoriesDelete";

const METHODS_TO_BIND = [
  "getHeadline",
  "getPriority",
  "getRemoveButton",
  "handleDeleteCancel",
  "handleOpenConfirm"
];

class RepositoriesTable extends React.Component {
  constructor() {
    super();

    this.state = {
      repositoryToRemove: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleOpenConfirm(repositoryToRemove) {
    this.setState({ repositoryToRemove });
  }

  handleDeleteCancel() {
    this.setState({ repositoryToRemove: null });
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      active: prop === sortBy.prop,
      clickable: row == null, // this is a header
      "text-align-right": prop === "priority"
    });
  }

  getColumns() {
    const { repositories } = this.props;
    const getClassName = this.getClassName;
    const heading = ResourceTableUtil.renderHeading(
      RepositoriesTableHeaderLabels
    );
    const sortFunction = TableUtil.getSortFunction("uri", function(item, prop) {
      if (prop === "priority") {
        return repositories.getPriority(item);
      }

      return item.get(prop);
    });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "name",
        render: this.getHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "uri",
        render: this.getUri,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "priority",
        render: this.getPriority,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading() {},
        prop: "removed",
        render: this.getRemoveButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "30%" }} />
        <col />
        <col style={{ width: "112px" }} />
        <col style={{ width: "85px" }} />
      </colgroup>
    );
  }

  getUri(prop, repository) {
    return <CollapsingString string={repository.get("uri")} />;
  }

  getHeadline(prop, repository) {
    return (
      <div className="table-cell-emphasized text-overflow">
        {repository.get("name")}
      </div>
    );
  }

  getPriority(prop, repository) {
    return this.props.repositories.getPriority(repository);
  }

  getRemoveButton(prop, repositoryToRemove) {
    return (
      <div className="flex-align-right">
        <a
          className="button button-danger-link table-display-on-row-hover"
          onClick={this.handleOpenConfirm.bind(this, repositoryToRemove)}
        >
          {StringUtil.capitalize(UserActions.DELETE)}
        </a>
      </div>
    );
  }

  render() {
    const { props, state } = this;

    return (
      <div>
        <Table
          className="table table-flush table-borderless-outer table-borderless-inner-columns flush-bottom table-hover"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={props.repositories.getItems().slice()}
          sortBy={{ prop: "priority", order: "asc" }}
        />
        <RepositoriesDelete
          repository={state.repositoryToRemove}
          onClose={this.handleDeleteCancel}
        />
      </div>
    );
  }
}

RepositoriesTable.defaultProps = {
  repositories: new List()
};

RepositoriesTable.propTypes = {
  repositories: PropTypes.object.isRequired,
  removeRepository: PropTypes.func.isRequired,
  repositoryRemoveError: PropTypes.string,
  pendingRequest: PropTypes.bool.isRequired
};

module.exports = RepositoriesTable;
