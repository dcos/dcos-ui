import mixin from "reactjs-mixin";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import Page from "../../../../../../src/js/components/Page";
import Pod from "../../structs/Pod";
import PodConfigurationContainer
  from "../pod-configuration/PodConfigurationContainer";
import PodDebugContainer from "../pod-debug/PodDebugContainer";
import PodHeader from "./PodHeader";
import PodInstancesContainer from "../pod-instances/PodInstancesContainer";
import TabsMixin from "../../../../../../src/js/mixins/TabsMixin";

const METHODS_TO_BIND = [
  "handleActionDestroy",
  "handleActionEdit",
  "handleActionScale",
  "handleActionSuspend"
];

class PodDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      instances: "Instances",
      configuration: "Configuration",
      debug: "Debug"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleActionDestroy() {
    const { pod } = this.props;
    this.context.modalHandlers.deleteService({ pod });
  }

  handleActionEdit() {
    const { pod } = this.props;
    this.context.router.push(
      `/services/overview/${encodeURIComponent(pod.getId())}/edit/`
    );
  }

  handleActionScale() {
    const { pod } = this.props;
    this.context.modalHandlers.scaleService({ pod });
  }

  handleActionSuspend() {
    const { pod } = this.props;
    this.context.modalHandlers.suspendService({ pod });
  }

  renderConfigurationTabView() {
    const { pod } = this.props;

    return <PodConfigurationContainer pod={pod} />;
  }

  renderDebugTabView() {
    const { pod } = this.props;

    return <PodDebugContainer pod={pod} />;
  }

  renderInstancesTabView() {
    const { pod } = this.props;

    return <PodInstancesContainer pod={pod} />;
  }

  getActions() {
    const { pod } = this.props;
    const instanceCount = pod.getInstancesCount();

    const actions = [];

    actions.push({
      label: "Edit",
      onItemSelect: this.handleActionEdit
    });

    actions.push({
      label: "Scale",
      onItemSelect: this.handleActionScale
    });

    if (instanceCount > 0) {
      actions.push({
        label: "Suspend",
        onItemSelect: this.handleActionSuspend
      });
    }

    actions.push({
      className: "text-danger",
      label: "Destroy",
      onItemSelect: this.handleActionDestroy
    });

    return actions;
  }

  getTabs() {
    const activeTab = this.state.currentTab;

    return [
      {
        label: "Instances",
        callback: () => {
          this.setState({ currentTab: "instances" });
        },
        isActive: activeTab === "instances"
      },
      {
        label: "Configuration",
        callback: () => {
          this.setState({ currentTab: "configuration" });
        },
        isActive: activeTab === "configuration"
      },
      {
        label: "Debug",
        callback: () => {
          this.setState({ currentTab: "debug" });
        },
        isActive: activeTab === "debug"
      }
    ];
  }

  render() {
    const { children, pod } = this.props;

    const breadcrumbs = <ServiceBreadcrumbs serviceID={pod.id} />;

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={breadcrumbs}
          tabs={this.getTabs()}
        >
          <PodHeader
            onDestroy={this.handleActionDestroy}
            onEdit={this.handleActionEdit}
            onScale={this.handleActionScale}
            onSuspend={this.handleActionSuspend}
            pod={pod}
            tabs={this.tabs_getUnroutedTabs()}
          />
        </Page.Header>
        {this.tabs_getTabView()}
        {children}
      </Page>
    );
  }
}

PodDetail.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired,
  router: routerShape
};

PodDetail.propTypes = {
  children: PropTypes.node,
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetail;
