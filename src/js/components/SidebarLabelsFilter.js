import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';

import Icon from './Icon';
import QueryParamsMixin from '../mixins/QueryParamsMixin';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';
import ServiceUtil from '../utils/ServiceUtil';
import ServiceFilterTypes from '../constants/ServiceFilterTypes';

const PropTypes = React.PropTypes;

const METHODS_TO_BIND = [
  'handleActionSelection',
  'updateSelectedLabels'
];

class SidebarLabelsFilters extends mixin(QueryParamsMixin) {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.state = {
      availableLabels: [],
      selectedLabels: []
    };
  }

  componentWillMount() {
    this.setState({
      availableLabels: this.getAvailableLabels(this.props.services)
    }, this.updateSelectedLabels());
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      availableLabels: this.getAvailableLabels(nextProps.services)
    }, this.updateSelectedLabels());
  }

  getAvailableLabels(services) {
    return services.reduce(function (memo, item) {
      if (item instanceof Service) {
        let labels = ServiceUtil.convertServiceLabelsToArray(item);
        labels.forEach(function ({key, value}) {
          let index = memo.findIndex(function (label) {
            return label.key === key && label.value === value;
          });

          if (0 > index) {
            memo = memo.concat([{key, value}]);
          }
        });
      }
      if (item instanceof ServiceTree) {
        memo = memo.concat(item.getLabels());
      }

      return memo;
    },  [])
    .sort((a, b) => a.key.localeCompare(b.key));
  }

  getLabelsDropdown() {
    let {state} = this;
    let availableLabels = state.availableLabels.map(function (label, i) {
      let labelText = `${label.key} : ${label.value}`;

      return Object.assign({}, label, {
        id: `filter-label-${i}`,
        html: (
          <a className="text-overflow" title={labelText}>
            {labelText}
          </a>
        )
      });
    });

    let labelOptions = [{
      className: 'hidden',
      id: '0',
      html: 'Labels',
      selectable: false
    }].concat(availableLabels);

    return (
      <Dropdown
        buttonClassName="button button-inverse dropdown-toggle button-wide button-split-content"
        dropdownMenuClassName="dropdown-menu inverse"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        items={labelOptions}
        onItemSelection={this.handleActionSelection}
        persistentID="0"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown dropdown-wide" />
    );
  }

  getSelectedLabels() {
    let {selectedLabels} = this.state;

    if (selectedLabels == null || selectedLabels.length === 0) {
      return null;
    }

    const labelClassName = classNames(
      'label-pill badge text-muted text-overflow inverse'
    );

    const removeLabelClassNames = classNames(
      'badge text-muted inverse clickable text-align-center remove-filter'
    );

    let labelNodes = selectedLabels.map(({key, value}, i) => {
      let labelText = `${key} : ${value}`;
      return (
        <li className={labelClassName} key={i} title={labelText}>
          <div className="text-overflow pill-wrap">
            <span className="text-overflow">{labelText}</span>
            <a className={removeLabelClassNames}
               onClick={this.handleActionSelection.bind(this, {key, value})}>
              <Icon family="mini" id="close" size="tiny" />
            </a>
          </div>
        </li>
      );
    });

    if (labelNodes.length === 0) {
      return null;
    }

    const labelsListClassNames = classNames(
      'container-pod container-pod-super-super-short flush-bottom list-unstyled'
    );

    return (
      <ul className={labelsListClassNames}>
        {labelNodes}
      </ul>
    )
  }

  handleActionSelection({key, value}) {
    const {selectedLabels} = this.state;
    const stringify = JSON.stringify;
    let nextSelectedLabels = selectedLabels.slice();

    let labelIndex = selectedLabels.findIndex(function (item) {
      return item.key === key && item.value === value;
    });

    if (labelIndex > -1) {
      nextSelectedLabels.splice(labelIndex, 1);
    } else {
      nextSelectedLabels = nextSelectedLabels.concat([{key, value}]);
    }

    if (stringify(nextSelectedLabels) !== stringify(selectedLabels)) {
      let labels = nextSelectedLabels.map(label => {
        return [label.key, label.value];
      });

      this.setQueryParam(ServiceFilterTypes.LABELS, labels);
      this.props.handleFilterChange(labels, ServiceFilterTypes.LABELS);
    }
  }

  updateSelectedLabels() {
    const state = this.state;
    const stringify = JSON.stringify;
    let {router} = this.context;
    let query = Object.assign({}, router.getCurrentQuery());
    let selectedLabels = query[ServiceFilterTypes.LABELS];
    let nextSelectedLabels = [];

    if (selectedLabels != null) {
      nextSelectedLabels = selectedLabels.map(label => {
        let [key, value] = this.decodeQueryParamArray(label);

        return {key, value};
      });
    }

    if (stringify(nextSelectedLabels) !== stringify(state.selectedLabels)) {
      this.setState({selectedLabels: nextSelectedLabels});
    }
  }

  render() {
    if (this.state.availableLabels.length === 0) {
      return null;
    }

    return (
      <div className="side-list sidebar-filters hidden-medium hidden-small hidden-mini">
        <div className="flex-box flex-align-right flush">
        </div>
        {this.getLabelsDropdown()}
        {this.getSelectedLabels()}
      </div>
    );
  }
}

SidebarLabelsFilters.propTypes = {
  handleFilterChange: PropTypes.func.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = SidebarLabelsFilters;
