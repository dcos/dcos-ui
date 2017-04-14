import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ContextualXHRError from '../../components/ContextualXHRError';
import TaskDetail from '../../../../plugins/services/src/js/pages/task-details/TaskDetail';
import MesosStateStore from '../../stores/MesosStateStore';
import JobsBreadcrumbs from '../../components/breadcrumbs/JobsBreadcrumbs';
import Page from '../../components/Page';

const dontScrollRoutes = [
  /\/files\/view.*$/,
  /\/logs.*$/
];

const METHODS_TO_BIND = [
  'onStateStoreSuccess',
  'onStateStoreError'
];

class JobTaskDetailPage extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: 0,
      mesosXHRError: null
    };

    this.store_listeners = [
      {name: 'state', events: ['success', 'error'], suppressUpdate: true}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onStateStoreSuccess() {
    // Throttle updates
    if (Date.now() - this.state.lastUpdate > 1000
      || this.state.mesosXHRError) {

      this.setState({
        lastUpdate: Date.now(),
        mesosXHRError: null
      });
    }
  }

  onStateStoreError(xhr) {
    this.setState({
      mesosXHRError: xhr
    });
  }

  render() {
    const {location, params, routes} = this.props;
    const {id, taskID} = params;
    const {mesosXHRError} = this.state;

    const routePrefix = `/jobs/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      {label: 'Details', routePath: routePrefix + '/details'},
      {label: 'Files', routePath: routePrefix + '/files'},
      {label: 'Logs', routePath: routePrefix + '/logs'}
    ];

    if (mesosXHRError) {
      return <ContextualXHRError xhr={mesosXHRError} />;
    }

    const task = MesosStateStore.getTaskFromTaskID(taskID);

    let breadcrumbs;
    if (task != null) {
      breadcrumbs = (
        <JobsBreadcrumbs
          jobID={id}
          taskID={task.getId()}
          taskName={task.getName()} />
      );
    } else {
      breadcrumbs = <JobsBreadcrumbs />;
    }

    const dontScroll = dontScrollRoutes.some((regex) => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID="jobs"/>
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

JobTaskDetailPage.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = JobTaskDetailPage;

