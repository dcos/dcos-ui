import React from 'react';

import TaskDetail from './TaskDetail';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import ServiceBreadcrumbs from '../../components/ServiceBreadcrumbs';
import Page from '../../../../../../src/js/components/Page';

class ServiceTaskDetailPage extends React.Component {
  render() {
    const {params, routes} = this.props;
    const {id, taskID} = params;

    let routePrefix = `/services/overview/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      {label: 'Details', routePath: routePrefix + '/details'},
      {label: 'Files', routePath: routePrefix + '/files'},
      {label: 'Logs', routePath: routePrefix + '/view'}
    ];

    let task = MesosStateStore.getTaskFromTaskID(taskID);
    if (task == null) {
      return this.getNotFound('task', taskID);
    }

    const breadcrumbs = (
      <ServiceBreadcrumbs
        serviceID={id}
        taskID={task.getId()}
        taskName={task.getName()} />
    );

    return (
      <Page>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID="services" />
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

TaskDetail.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = ServiceTaskDetailPage;
