import React from 'react';
import {Link} from 'react-router';

import MesosStateStore from '../../../stores/MesosStateStore';
import Page from '../../../components/Page';
import TaskDetail from '../../../../../plugins/services/src/js/pages/task-details/TaskDetail';
import VirtualNetworksStore from '../../../stores/VirtualNetworksStore';

const dontScrollRoutes = [
  /\/files\/view.*$/,
  /\/logs.*$/
];

const NetworksDetailTaskBreadcrumbs = ({overlayID, overlay, taskID, task}) => {
  const crumbs = [
    <Link to="/networking/networks" key={-1}>Networks</Link>
  ];

  let overlayName = overlayID;
  if (overlay) {
    overlayName = overlay.getName();
    crumbs.push(<Link to={`/networking/networks/${overlayName}`} key={0}>{overlayName}</Link>);
  } else {
    crumbs.push(<span>{overlayID}</span>);
  }

  if (task) {
    const taskName = task.getName();
    crumbs.push(<Link to={`/networking/networks/${overlayName}/tasks/${taskName}`}>{taskName}</Link>);
  } else {
    crumbs.push(<span>{taskID}</span>);
  }

  return <Page.Header.Breadcrumbs iconID="network" breadcrumbs={crumbs} />;
};

class VirtualNetworkTaskPage extends React.Component {
  render() {
    const {location, params, routes} = this.props;
    const {overlayName, taskID} = params;

    const routePrefix = `/networking/networks/${overlayName}/tasks/${taskID}`;
    const tabs = [
      {label: 'Details', routePath: routePrefix + '/details'},
      {label: 'Files', routePath: routePrefix + '/files'},
      {label: 'Logs', routePath: routePrefix + '/logs'}
    ];

    const task = MesosStateStore.getTaskFromTaskID(taskID);

    const overlay = VirtualNetworksStore.getOverlays().findItem((overlay) => {
      return overlay.getName() === overlayName;
    });

    let breadcrumbs;
    if (task != null) {
      breadcrumbs = (
        <NetworksDetailTaskBreadcrumbs
          overlayID={overlayName}
          overlay={overlay}
          taskID={taskID}
          taskName={task.getName()} />
      );
    } else {
      breadcrumbs = <NetworksDetailTaskBreadcrumbs />;
    }

    const dontScroll = dontScrollRoutes.some((regex) => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID="Networks"/>
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

VirtualNetworkTaskPage.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = VirtualNetworkTaskPage;
