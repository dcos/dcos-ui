import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";
import { Link } from "react-router";

import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "../../../components/Breadcrumb";
import BreadcrumbTextContent from "../../../components/BreadcrumbTextContent";
import MesosStateStore from "../../../stores/MesosStateStore";
import Page from "../../../components/Page";
import TaskDetail from "../../../../../plugins/services/src/js/pages/task-details/TaskDetail";
import VirtualNetworksStore from "../../../stores/VirtualNetworksStore";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

const NetworksDetailTaskBreadcrumbs = ({
  overlayID,
  overlay,
  taskID,
  task,
}) => {
  const crumbs = [
    <Breadcrumb key={0} title="Networks">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/networking/networks" />}>Networks</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  if (overlay) {
    crumbs.push(
      <Breadcrumb key={1} title={overlay.name}>
        <BreadcrumbTextContent>
          <Link to={`/networking/networks/${overlay.name}`}>
            {overlay.name}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  } else {
    crumbs.push(
      <Breadcrumb key={1} title={overlayID}>
        <BreadcrumbTextContent>{overlayID}</BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  const overlayName = overlay?.name || overlayID;
  if (task) {
    const taskName = task.getName();
    crumbs.push(
      <Breadcrumb key={2} title={taskName}>
        <BreadcrumbTextContent>
          <Link to={`/networking/networks/${overlayName}/tasks/${taskName}`}>
            {taskName}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  } else {
    crumbs.push(
      <Breadcrumb key={2} title={taskID}>
        <BreadcrumbTextContent>{taskID}</BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Network}
      breadcrumbs={crumbs}
    />
  );
};

const VirtualNetworkTaskPage = (props) => {
  const { location, params, routes } = props;
  const { overlayName, taskID } = params;

  const routePrefix = `/networking/networks/${overlayName}/tasks/${taskID}`;
  const tabs = [
    { label: i18nMark("Details"), routePath: routePrefix + "/details" },
    { label: i18nMark("Files"), routePath: routePrefix + "/files" },
    { label: i18nMark("Logs"), routePath: routePrefix + "/logs" },
  ];

  const task = MesosStateStore.getTaskFromTaskID(taskID);

  const overlay = VirtualNetworksStore.overlays.find(
    ({ name }) => name === overlayName
  );

  const dontScroll = dontScrollRoutes.some((regex) =>
    regex.test(location.pathname)
  );

  return (
    <Page dontScroll={dontScroll}>
      <Page.Header
        breadcrumbs={
          <NetworksDetailTaskBreadcrumbs
            overlayID={overlayName}
            overlay={overlay}
            taskID={taskID}
            task={task}
          />
        }
        tabs={tabs}
        iconID={ProductIcons.Network}
      />
      <TaskDetail params={params} routes={routes}>
        {props.children}
      </TaskDetail>
    </Page>
  );
};

VirtualNetworkTaskPage.propTypes = {
  params: PropTypes.object,
  routes: PropTypes.array,
};

export default VirtualNetworkTaskPage;
