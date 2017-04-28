import mixin from "reactjs-mixin";
import React, { PropTypes } from "react";
import { routerShape } from "react-router";

import Page from "#SRC/js/components/Page";
import RouterUtil from "#SRC/js/utils/RouterUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import UserActions from "#SRC/js/constants/UserActions";

import Pod from "../../structs/Pod";
import PodHeader from "./PodHeader";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";
import ServiceModals from "../../components/modals/ServiceModals";

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
      "/services/overview/:id/tasks": "Instances",
      "/services/overview/:id/configuration": "Configuration",
      "/services/overview/:id/debug": "Debug"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    super.componentWillMount(...arguments);
    this.updateCurrentTab();
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    this.updateCurrentTab(nextProps);
  }

  updateCurrentTab(props = this.props) {
    const { routes } = props;
    const currentTab = RouterUtil.reconstructPathFromRoutes(routes);
    if (currentTab != null) {
      this.setState({ currentTab });
    }
  }

  handleActionDestroy() {
    const { pod } = this.props;
    this.context.modalHandlers.deleteService({ pod });
  }

  handleActionEdit() {
    const { pod } = this.props;
    this.context.router.push(
      `/services/detail/${encodeURIComponent(pod.getId())}/edit/`
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
      label: StringUtil.capitalize(UserActions.DELETE),
      onItemSelect: this.handleActionDestroy
    });

    return actions;
  }

  getTabs() {
    const { pod: { id } } = this.props;
    const routePrefix = `/services/detail/${encodeURIComponent(id)}`;

    return [
      { label: "Instances", routePath: `${routePrefix}/tasks` },
      { label: "Configuration", routePath: `${routePrefix}/configuration` },
      { label: "Debug", routePath: `${routePrefix}/debug` }
    ];
  }

  render() {
    const { children, pod } = this.props;

    const breadcrumbs = <ServiceBreadcrumbs serviceID={pod.id} />;

    // TODO (DCOS_OSS-1038): Move cloned props to route parameters
    const clonedProps = { pod };
    const clonedChildren = React.Children.map(children, function(child) {
      // Only add props to children that are not ServiceModals
      if (child.type === ServiceModals) {
        return child;
      }

      return React.cloneElement(child, clonedProps);
    });

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
            tabs={this.getTabs()}
          />
        </Page.Header>
        {clonedChildren}
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
