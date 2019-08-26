import PropTypes from "prop-types";
import React from "react";
import { i18nMark, withI18n } from "@lingui/react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";
import Helmet from "react-helmet";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import Page from "#SRC/js/components/Page";

import TaskDetail from "./TaskDetail";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

class ServiceTaskDetailPage extends React.PureComponent {
  render() {
    const { location, params, routes, i18n } = this.props;
    const { id, taskID } = params;

    const routePrefix = `/services/detail/${encodeURIComponent(
      id
    )}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      { label: i18nMark("Details"), routePath: routePrefix + "/details" },
      { label: i18nMark("Files"), routePath: routePrefix + "/files" },
      { label: i18nMark("Logs"), routePath: routePrefix + "/logs" }
    ];

    const task = MesosStateStore.getTaskFromTaskID(taskID);
    let breadcrumbs;
    if (task != null) {
      breadcrumbs = (
        <ServiceBreadcrumbs
          serviceID={id}
          taskID={task.getId()}
          taskName={task.getName()}
        />
      );
    } else {
      breadcrumbs = <ServiceBreadcrumbs serviceID={id} />;
    }

    const dontScroll = dontScrollRoutes.some(regex => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID={ProductIcons.Services}
        />
        <Helmet>
          <title>{`${i18n._(i18nMark("Services Task Detail"))} - ${
            task ? task.getId() : id
          } - ${i18n._(i18nMark("Services"))}`}</title>
        </Helmet>
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

ServiceTaskDetailPage.propTypes = {
  params: PropTypes.object,
  routes: PropTypes.array
};

module.exports = withI18n()(ServiceTaskDetailPage);
