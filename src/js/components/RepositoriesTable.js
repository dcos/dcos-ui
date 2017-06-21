import classNames from "classnames";
import { Confirm, Table } from "reactjs-components";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { ResourceTableUtil } from "foundation-ui";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CollapsingString from "./CollapsingString";
import Config from "../config/Config";
import CosmosPackagesStore from "../stores/CosmosPackagesStore";
import List from "../structs/List";
import ModalHeading from "./modals/ModalHeading";
import RepositoriesTableHeaderLabels
  from "../constants/RepositoriesTableHeaderLabels";
import TableUtil from "../utils/TableUtil";

const METHODS_TO_BIND = [
  "getHeadline",
  "getPriority",
  "getRemoveButton",
  "handleDeleteCancel",
  "handleDeleteRepository",
  "handleOpenConfirm"
];

class RepositoriesTable extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      repositoryToRemove: null,
      repositoryRemoveError: null,
      pendingRequest: false
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["repositoryDeleteError", "repositoryDeleteSuccess"],
        listenAlways: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreRepositoryDeleteError(error) {
    this.setState({ repositoryRemoveError: error, pendingRequest: false });
  }

  onCosmosPackagesStoreRepositoryDeleteSuccess() {
    this.setState({
      repositoryToRemove: null,
      repositoryRemoveError: null,
      pendingRequest: false
    });
    CosmosPackagesStore.fetchRepositories();
  }

  handleOpenConfirm(repositoryToRemove) {
    this.setState({ repositoryToRemove });
  }

  handleDeleteCancel() {
    this.setState({ repositoryToRemove: null });
  }

  handleDeleteRepository() {
    const { repositoryToRemove } = this.state;
    CosmosPackagesStore.deleteRepository(
      repositoryToRemove.get("name"),
      repositoryToRemove.get("url")
    );

    this.setState({ pendingRequest: true });
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
          className="button button-link button-danger table-display-on-row-hover"
          onClick={this.handleOpenConfirm.bind(this, repositoryToRemove)}
        >
          Remove
        </a>
      </div>
    );
  }

  getRemoveModalContent() {
    const { repositoryRemoveError, repositoryToRemove } = this.state;
    let repositoryLabel = "This repository";
    if (repositoryToRemove && repositoryToRemove.get("name")) {
      repositoryLabel = repositoryToRemove.get("name");
    }

    let error = null;

    if (repositoryRemoveError != null) {
      error = <p className="text-error-state">{repositoryRemoveError}</p>;
    }

    return (
      <div className="text-align-center">
        <p>
          {`Repository (${repositoryLabel}) will be removed from ${Config.productName}. You will not be able to install any packages belonging to that repository anymore.`}
        </p>
        {error}
      </div>
    );
  }

  render() {
    const { props, state } = this;
    const heading = (
      <ModalHeading>
        Are you sure?
      </ModalHeading>
    );

    return (
      <div>
        <Table
          className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={props.repositories.getItems().slice()}
          sortBy={{ prop: "priority", order: "asc" }}
        />
        <Confirm
          closeByBackdropClick={true}
          disabled={state.pendingRequest}
          header={heading}
          open={!!state.repositoryToRemove}
          onClose={this.handleDeleteCancel}
          leftButtonCallback={this.handleDeleteCancel}
          rightButtonCallback={this.handleDeleteRepository}
          rightButtonClassName="button button-danger"
          rightButtonText="Remove Repository"
          showHeader={true}
        >
          {this.getRemoveModalContent()}
        </Confirm>
      </div>
    );
  }
}

RepositoriesTable.defaultProps = {
  repositories: new List()
};

RepositoriesTable.propTypes = {
  repositories: React.PropTypes.object.isRequired
};

module.exports = RepositoriesTable;
