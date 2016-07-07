import classNames from 'classnames';
import {Confirm, Table} from 'reactjs-components';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CollapsingString from './CollapsingString';
import Config from '../config/Config';
import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import List from '../structs/List';
import RepositoriesTableHeaderLabels from '../constants/RepositoriesTableHeaderLabels';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';

const METHODS_TO_BIND = [
  'getHeadline',
  'getPriority',
  'getRemoveButton',
  'handleDeleteCancel',
  'handleDeleteRepository',
  'handleOpenConfirm'
];

class RepositoriesTable extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      repositoryToRemove: null,
      repositoryRemoveError: null,
      pendingRequest: false
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: ['repositoryDeleteError', 'repositoryDeleteSuccess'],
      unmountWhen: function () {
        return true;
      },
      listenAlways: true
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreRepositoryDeleteError(error) {
    this.setState({repositoryRemoveError: error, pendingRequest: false});
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
    this.setState({repositoryToRemove});
  }

  handleDeleteCancel() {
    this.setState({repositoryToRemove: null});
  }

  handleDeleteRepository() {
    let {repositoryToRemove} = this.state;
    CosmosPackagesStore.deleteRepository(
      repositoryToRemove.get('name'),
      repositoryToRemove.get('url')
    );

    this.setState({pendingRequest: true});
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': row == null, // this is a header
      'text-align-right': prop === 'priority'
    });
  }

  getColumns() {
    let {repositories} = this.props;
    let getClassName = this.getClassName;
    let heading = ResourceTableUtil
      .renderHeading(RepositoriesTableHeaderLabels);
    let sortFunction = TableUtil.getSortFunction('uri', function (item, prop) {
      if (prop === 'priority') {
        return repositories.getPriority(item);
      }

      return item.get(prop);
    });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'name',
        render: this.getHeadline,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'uri',
        render: this.getUri,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'priority',
        render: this.getPriority,
        sortable: true,
        sortFunction
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading: function () {},
        prop: 'removed',
        render: this.getRemoveButton,
        sortable: false
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '30%'}} />
        <col />
        <col style={{width: '112px'}} />
        <col style={{width: '85px'}} />
      </colgroup>
    );
  }

  getUri(prop, repository) {
    return (
      <CollapsingString string={repository.get('uri')} />
    );
  }

  getHeadline(prop, repository) {
    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className="text-overflow">
          {repository.get('name')}
        </span>
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
          onClick={this.handleOpenConfirm.bind(this, repositoryToRemove)}>
          Remove
        </a>
      </div>
    );
  }

  getRemoveModalContent() {
    let {repositoryRemoveError, repositoryToRemove} = this.state;
    let repositoryLabel = 'This repository';
    if (repositoryToRemove && repositoryToRemove.get('name')) {
      repositoryLabel = repositoryToRemove.get('name');
    }

    let error = null;

    if (repositoryRemoveError != null) {
      error = (
        <p className="text-error-state">{repositoryRemoveError}</p>
      );
    }

    return (
      <div className="container-pod container-pod-short text-align-center">
        <h3 className="flush-top">Are you sure?</h3>
        <p>
          {`Repository (${repositoryLabel}) will be removed from ${Config.productName}. You will not be able to install any packages belonging to that repository anymore.`}
        </p>
        {error}
      </div>
    );
  }

  render() {
    let {props, state} = this;

    return (
      <div>
        <Table
          className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={props.repositories.getItems().slice()}
          sortBy={{prop: 'priority', order: 'asc'}} />
        <Confirm
          closeByBackdropClick={true}
          disabled={state.pendingRequest}
          footerContainerClass="container container-pod container-pod-short
            container-pod-fluid flush-top flush-bottom"
          open={!!state.repositoryToRemove}
          onClose={this.handleDeleteCancel}
          leftButtonCallback={this.handleDeleteCancel}
          rightButtonCallback={this.handleDeleteRepository}
          rightButtonClassName="button button-danger"
          rightButtonText="Remove Repository">
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
