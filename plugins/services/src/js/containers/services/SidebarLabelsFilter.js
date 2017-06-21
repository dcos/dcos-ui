import classNames from "classnames";
import { Dropdown } from "reactjs-components";
import React from "react";

import Icon from "../../../../../../src/js/components/Icon";
import Service from "../../structs/Service";
import ServiceTree from "../../structs/ServiceTree";
import ServiceUtil from "../../utils/ServiceUtil";
import ServiceFilterTypes from "../../constants/ServiceFilterTypes";

const PropTypes = React.PropTypes;

const METHODS_TO_BIND = ["handleActionSelection", "updateSelectedLabels"];

class SidebarLabelsFilters extends React.Component {
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
    this.setState(
      {
        availableLabels: this.getAvailableLabels(this.props.services)
      },
      this.updateSelectedLabels
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        availableLabels: this.getAvailableLabels(nextProps.services)
      },
      this.updateSelectedLabels
    );
  }

  getAvailableLabels(services) {
    return services
      .reduce(function(memo, item) {
        if (item instanceof Service) {
          const labels = ServiceUtil.convertServiceLabelsToArray(item);
          labels.forEach(function({ key, value }) {
            const index = memo.findIndex(function(label) {
              return label.key === key && label.value === value;
            });

            if (index < 0) {
              memo = memo.concat([{ key, value }]);
            }
          });
        }
        if (item instanceof ServiceTree) {
          memo = memo.concat(item.getLabels());
        }

        return memo;
      }, [])
      .sort((a, b) => a.key.localeCompare(b.key));
  }

  getLabelsDropdown() {
    const { state } = this;
    const availableLabels = state.availableLabels.map(function(label, i) {
      const labelText = `${label.key} : ${label.value}`;

      return Object.assign({}, label, {
        id: `filter-label-${i}`,
        html: (
          <div className="button-split-content-wrapper">
            <a
              className="button-split-content-item text-overflow"
              title={labelText}
            >
              {labelText}
            </a>
          </div>
        )
      });
    });

    const labelOptions = [
      {
        className: "hidden",
        id: "0",
        html: (
          <div className="button-split-content-wrapper">
            <span className="button-split-content-item">
              Filter by Label
            </span>
          </div>
        ),
        selectable: false
      }
    ].concat(availableLabels);

    return (
      <Dropdown
        buttonClassName="button dropdown-toggle button-split-content"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        items={labelOptions}
        onItemSelection={this.handleActionSelection}
        persistentID="0"
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown dropdown-wide"
      />
    );
  }

  getSelectedLabels() {
    const { selectedLabels } = this.state;

    if (selectedLabels == null || selectedLabels.length === 0) {
      return null;
    }

    const labelClassName = classNames("label-pill text-muted text-overflow");

    const removeLabelClassNames = classNames(
      "text-muted clickable text-align-center remove-filter"
    );

    const labelNodes = selectedLabels.map(({ key, value }, i) => {
      const labelText = `${key} : ${value}`;

      return (
        <li className={labelClassName} key={i} title={labelText}>
          <div className="text-overflow pill-wrap">
            <span className="text-overflow">{labelText}</span>
            <a
              className={removeLabelClassNames}
              onClick={this.handleActionSelection.bind(this, { key, value })}
            >
              <Icon id="close" size="tiny" family="tiny" />
            </a>
          </div>
        </li>
      );
    });

    if (labelNodes.length === 0) {
      return null;
    }

    const labelsListClassNames = classNames(
      "pod pod-shorter flush-right flush-bottom flush-left list-unstyled"
    );

    return (
      <ul className={labelsListClassNames}>
        {labelNodes}
      </ul>
    );
  }

  handleActionSelection(event) {
    const { key, value } = event;
    const { selectedLabels } = this.state;
    const nextSelectedLabels = selectedLabels.slice();

    const labelIndex = selectedLabels.findIndex(function(item) {
      return item.key === key && item.value === value;
    });

    if (labelIndex > -1) {
      nextSelectedLabels.splice(labelIndex, 1);
    } else {
      nextSelectedLabels.push({ key, value });
    }

    this.props.handleFilterChange(
      ServiceFilterTypes.LABELS,
      nextSelectedLabels
    );
  }

  updateSelectedLabels() {
    const state = this.state;
    const stringify = JSON.stringify;
    const selectedLabels = this.props.filters[ServiceFilterTypes.LABELS] || [];

    if (stringify(selectedLabels) !== stringify(state.selectedLabels)) {
      this.setState({ selectedLabels });
    }
  }

  render() {
    if (this.state.availableLabels.length === 0) {
      return null;
    }

    return (
      <div className="side-list sidebar-filters pod flush-top flush-left">
        {this.getLabelsDropdown()}
        {this.getSelectedLabels()}
      </div>
    );
  }
}

SidebarLabelsFilters.propTypes = {
  handleFilterChange: React.PropTypes.func.isRequired,
  filters: React.PropTypes.object.isRequired,
  services: PropTypes.array.isRequired
};

module.exports = SidebarLabelsFilters;
