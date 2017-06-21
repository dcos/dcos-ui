import React from "react";
import { routerShape } from "react-router";

import FilterHeadline from "../../../../../../src/js/components/FilterHeadline";
import Icon from "../../../../../../src/js/components/Icon";
import Pod from "../../structs/Pod";
import PodInstanceList from "../../structs/PodInstanceList";
import PodInstancesTable from "./PodInstancesTable";
import PodInstanceStatus from "../../constants/PodInstanceStatus";
import PodUtil from "../../utils/PodUtil";
import PodViewFilter from "./PodViewFilter";

const METHODS_TO_BIND = [
  "handleFilterChange",
  "handleFilterReset",
  "handleKillClick",
  "handleKillAndScaleClick",
  "handleSelectionChange"
];

class PodInstancesView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      filter: {
        text: "",
        status: "active"
      },
      selectedItems: []
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getInstanceFilterStatus(instance) {
    const status = instance.getInstanceStatus();
    switch (status) {
      case PodInstanceStatus.STAGED:
        return "staged";

      case PodInstanceStatus.HEALTHY:
      case PodInstanceStatus.UNHEALTHY:
      case PodInstanceStatus.RUNNING:
        return "active";

      case PodInstanceStatus.KILLED:
        return "completed";

      default:
        return "";
    }
  }

  getKillButtons() {
    if (!this.state.selectedItems.length) {
      return null;
    }

    return (
      <div className="button-collection flush-bottom">
        <div className="button button-link" onClick={this.handleKillClick}>
          <Icon id="repeat" size="mini" />
          <span>Restart</span>
        </div>
      </div>
    );
  }

  handleFilterChange(filter) {
    this.setState({ filter });
  }

  handleFilterReset() {
    this.setState({
      filter: {
        text: "",
        status: "all"
      }
    });
  }

  handleKillClick() {
    const { selectedItems } = this.state;

    if (!selectedItems.length) {
      return;
    }

    this.context.modalHandlers.killPodInstances({
      action: "restart",
      selectedItems
    });
  }

  handleKillAndScaleClick() {
    const { selectedItems } = this.state;

    if (!selectedItems.length) {
      return;
    }

    this.context.modalHandlers.killPodInstances({
      action: "stop",
      selectedItems
    });
  }

  handleSelectionChange(selectedItems) {
    this.setState({ selectedItems });
  }

  render() {
    const { filter } = this.state;
    const { instances } = this.props;

    let filteredTextItems = instances;
    let filteredItems = instances;

    if (filter.text) {
      filteredTextItems = instances.filterItems(instance => {
        return PodUtil.isInstanceOrChildrenMatchingText(instance, filter.text);
      });
      filteredItems = filteredTextItems;
    }

    if (filter.status && filter.status !== "all") {
      filteredItems = filteredTextItems.filterItems(instance => {
        return this.getInstanceFilterStatus(instance) === filter.status;
      });
    }

    return (
      <div>
        <FilterHeadline
          currentLength={filteredItems.getItems().length}
          isFiltering={filter.text || filter.status !== "all"}
          name="Instance"
          onReset={this.handleFilterReset}
          totalLength={instances.getItems().length}
        />
        <PodViewFilter
          filter={filter}
          items={filteredTextItems.getItems()}
          onFilterChange={this.handleFilterChange}
          statusChoices={["all", "active", "completed"]}
          statusMapper={this.getInstanceFilterStatus}
        >
          {this.getKillButtons()}
        </PodViewFilter>
        <PodInstancesTable
          filterText={filter.text}
          instances={filteredItems}
          onSelectionChange={this.handleSelectionChange}
          pod={this.props.pod}
        />
      </div>
    );
  }
}

PodInstancesView.contextTypes = {
  modalHandlers: React.PropTypes.shape({
    killPodInstances: React.PropTypes.func.isRequired
  }).isRequired,
  router: routerShape
};

PodInstancesView.propTypes = {
  instances: React.PropTypes.instanceOf(PodInstanceList).isRequired,
  pod: React.PropTypes.instanceOf(Pod).isRequired
};

module.exports = PodInstancesView;
