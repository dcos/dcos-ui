import PluginSDK from "PluginSDK";
import { request } from "@dcos/mesos-client";
import { Observable } from "rxjs/Observable";

import CompositeState from "../structs/CompositeState";
import Config from "../config/Config";
import DCOSStore from "./DCOSStore";
import Framework from "../../../plugins/services/src/js/structs/Framework";
import GetSetBaseStore from "./GetSetBaseStore";
import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR
} from "../constants/EventTypes";
import MesosStateUtil from "../utils/MesosStateUtil";
import pipe from "../utils/pipe";
import Task from "../../../plugins/services/src/js/structs/Task";
import { MesosStreamType } from "../core/MesosStream";
import container from "../container";
import * as mesosStreamParsers from "./MesosStream/parsers";

const METHODS_TO_BIND = ["setState", "onStreamData", "onStreamError"];

class MesosStateStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      lastMesosState: {},
      taskCache: {}
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: MESOS_STATE_CHANGE,
        error: MESOS_STATE_REQUEST_ERROR
      },
      unmountWhen(store, event) {
        if (event === "success") {
          return Object.keys(store.get("lastMesosState")).length;
        }
      },
      listenAlways: true
    });

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);

    if (this.shouldSubscribe()) {
      this.subscribe();
    }
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  shouldSubscribe() {
    return this.listeners(MESOS_STATE_CHANGE).length > 0 && !this.stream;
  }

  subscribe() {
    const mesosStream = container.get(MesosStreamType);
    const getMasterRequest = request(
      { type: "GET_MASTER" },
      "/mesos/api/v1?get_master"
    ).retry(3);

    const parsers = pipe(...Object.values(mesosStreamParsers));
    const dataStream = mesosStream
      .merge(getMasterRequest)
      .map(message => parsers(this.getLastMesosState(), JSON.parse(message)))
      .map(MesosStateUtil.flagMarathonTasks)
      .do(state => {
        CompositeState.addState(state);
        this.setState(state);
      });

    const waitStream = getMasterRequest.zip(mesosStream.take(1));
    const eventTriggerStream = dataStream.merge(
      // A lot of DCOS UI rely on the MesosStateStore emitting
      // MESOS_STATE_CHANGE events. After the switch to the stream, we lost this
      // event. To avoid a deeper refactor, we introduced this fake emitter.
      //
      // TODO: https://jira.mesosphere.com/browse/DCOS-18277
      Observable.interval(Config.getRefreshRate())
    );

    // Since we introduced the fake event above, we have to guarantee certain
    // refresh limits to the UI. They are:
    //
    // MOST once every (Config.getRefreshRate() * 0.5) ms. due to debounceTime.
    // LEAST once every tick of Config.getRefreshRate() ms in Observable.interval
    //
    // TODO: https://jira.mesosphere.com/browse/DCOS-18277
    this.stream = waitStream
      .concat(eventTriggerStream)
      .debounceTime(Config.getRefreshRate() * 0.5)
      .subscribe(this.onStreamData, this.onStreamError);
  }

  getLastMesosState() {
    return Object.assign(
      {
        executors: [],
        frameworks: [],
        master_info: {},
        slaves: [],
        tasks: []
      },
      this.get("lastMesosState")
    );
  }

  getHostResourcesByFramework(filter) {
    return MesosStateUtil.getHostResourcesByFramework(
      this.getLastMesosState(),
      filter
    );
  }

  getPodHistoricalInstances(pod) {
    return MesosStateUtil.getPodHistoricalInstances(
      this.getLastMesosState(),
      pod
    );
  }

  getServiceFromName(name) {
    const services = this.getLastMesosState().frameworks;

    if (services) {
      return services.find(function(service) {
        return service.name === name;
      });
    }

    return null;
  }

  getNodeFromID(id) {
    const nodes = this.getLastMesosState().slaves;

    if (nodes) {
      return nodes.find(function(node) {
        return node.id === id;
      });
    }

    return null;
  }

  getNodeFromHostname(hostname) {
    const nodes = this.getLastMesosState().slaves;

    if (nodes) {
      return nodes.find(function(node) {
        return node.hostname === hostname;
      });
    }

    return null;
  }

  getTasksFromNodeID(nodeID) {
    const { tasks, frameworks } = this.getLastMesosState();
    const memberTasks = {};

    const schedulerTasks = this.getSchedulerTasks();

    tasks.forEach(function(task) {
      const framework = frameworks.find(
        current => current.id === task.framework_id
      );
      if (task.slave_id === nodeID) {
        // Need to get service from Marathon because we need the labels.
        const service = DCOSStore.serviceTree.findItem(function(item) {
          return (
            item instanceof Framework &&
            item.getFrameworkName() === framework.name
          );
        });
        task = MesosStateUtil.assignSchedulerTaskField(task, schedulerTasks);
        task = MesosStateUtil.flagSDKTask(task, service);
        memberTasks[task.id] = task;
      }
    });

    return Object.values(memberTasks);
  }

  getTaskFromTaskID(taskID) {
    const taskCache = this.get("taskCache");
    const foundTask = taskCache[taskID];
    if (foundTask == null) {
      return null;
    }

    return new Task(foundTask);
  }

  /**
   * @return {Array} list of scheduler tasks
   */
  getSchedulerTasks() {
    const tasks = this.getTasksFromServiceName("marathon");

    return tasks.filter(function({ labels }) {
      if (!labels) {
        return false;
      }

      return labels.some(({ key }) => key === "DCOS_PACKAGE_FRAMEWORK_NAME");
    });
  }

  getSchedulerTaskFromServiceName(serviceName) {
    const tasks = this.getSchedulerTasks();

    return tasks.find(function({ labels }) {
      if (!labels) {
        return false;
      }

      return labels.some(({ key, value }) => {
        return key === "DCOS_PACKAGE_FRAMEWORK_NAME" && value === serviceName;
      });
    });
  }

  getTasksFromServiceName(serviceName) {
    const { tasks, frameworks } = this.getLastMesosState();

    if (!frameworks) {
      return null;
    }

    const framework = frameworks.find(function(framework) {
      return framework.active && framework.name === serviceName;
    });

    if (framework) {
      return tasks.filter(task => task != null).filter(task => {
        return task.framework_id === framework.id;
      });
    }

    return [];
  }

  getTasksByService(service) {
    const { frameworks, tasks = [] } = this.getLastMesosState();
    const serviceName = service.getName();

    // Convert serviceId to Mesos task name
    const mesosTaskName = service.getMesosId();

    if (!serviceName || !mesosTaskName || !frameworks) {
      return [];
    }

    const schedulerTasks = this.getSchedulerTasks();
    const serviceIsFramework = service && service instanceof Framework;
    const serviceFrameworkName = serviceIsFramework
      ? service.getFrameworkName()
      : serviceName;

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    let serviceTasks = [];
    if (serviceIsFramework) {
      const framework = frameworks.find(function(framework) {
        return framework.active && framework.name === serviceFrameworkName;
      });

      if (framework) {
        serviceTasks = tasks
          .filter(task => task.framework_id === framework.id)
          .map(task =>
            MesosStateUtil.assignSchedulerTaskField(task, schedulerTasks)
          )
          .map(task => MesosStateUtil.flagSDKTask(task, service));
      }
    }

    const marathon = frameworks.find(framework => {
      return framework.name === "marathon";
    });

    return tasks
      .filter(task => task.framework_id === marathon.id)
      .filter(({ name }) => name === mesosTaskName)
      .concat(serviceTasks)
      .map(task =>
        MesosStateUtil.assignSchedulerTaskField(task, schedulerTasks)
      )
      .map(task => MesosStateUtil.flagSDKTask(task, service));
  }

  getRunningTasksFromVirtualNetworkName(overlayName) {
    return MesosStateUtil.getRunningTasksFromVirtualNetworkName(
      this.getLastMesosState(),
      overlayName
    );
  }

  setState(state) {
    this.set({
      lastMesosState: state,
      taskCache: MesosStateUtil.indexTasksByID(state)
    });
  }

  onStreamData() {
    this.emit(MESOS_STATE_CHANGE);
  }

  onStreamError(error) {
    this.emit(MESOS_STATE_REQUEST_ERROR, error);

    // This was added in the past, so the stream does not swallow errors.
    // In its current format, it causes a problem with fixtures 1-pod and
    // 1-empty-group and makes ServiceFormModal, and PodDetailpPage tests fail.
    // We are removing this and addressing that, on a future ticket
    //
    // TODO: https://jira.mesosphere.com/browse/DCOS-20347
    if (process.env.NODE_ENV !== "production") {
      console.log("Mesos Store error: ", error);
      // throw error;
    }
  }

  get storeID() {
    return "state";
  }
}

module.exports = new MesosStateStore();
