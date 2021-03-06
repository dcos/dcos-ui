import CompositeState from "#SRC/js/structs/CompositeState";
import PluginSDK from "PluginSDK";
import { interval, of } from "rxjs";
import {
  merge,
  map,
  tap,
  sampleTime,
  retryWhen,
  zip,
  take,
  concat,
} from "rxjs/operators";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
import Task from "#PLUGINS/services/src/js/structs/Task";

import Config from "../config/Config";
import DCOSStore from "./DCOSStore";
import GetSetBaseStore from "./GetSetBaseStore";
import {
  MESOS_STATE_CHANGE,
  MESOS_STATE_REQUEST_ERROR,
} from "../constants/EventTypes";
import MesosStateUtil from "../utils/MesosStateUtil";
import { retryWithLinearBackoff } from "../utils/rxjsUtils";
import { MesosStreamType } from "../core/MesosStream";
import { MesosMasterRequestType } from "../core/MesosMasterRequest";
import container from "../container";
import * as mesosStreamParsers from "./MesosStream/parsers";

const pipe = (callables: any[]) => (state, ...rest) =>
  callables.reduce((acc, c) => c.call(c, acc, ...rest), state);

class MesosStateStore extends GetSetBaseStore {
  ready;
  resolve;
  stream;

  constructor() {
    super();

    this.ready = new Promise((resolve) => {
      this.resolve = resolve;
    });

    this.getSet_data = {
      lastMesosState: {},
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: MESOS_STATE_CHANGE,
        error: MESOS_STATE_REQUEST_ERROR,
      },
      unmountWhen: () => false,
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
    const mesos$ = container.get(MesosStreamType);
    const masterRequest$ = container.get(MesosMasterRequestType).pipe(
      tap((response) => {
        const master = mesosStreamParsers.getMaster(
          this.getMaster(),
          JSON.parse(response)
        );
        CompositeState.addMasterInfo(master.master_info);
        this.set({ master });
      })
    );

    const parsers = pipe(Object.values(mesosStreamParsers));
    const data$ = mesos$.pipe(
      map((message) => parsers(this.getLastMesosState(), message)),
      tap((state) => {
        this.set({ lastMesosState: state });

        // This is the moment that we first have full information from the
        // mesos-stream. We'll see a couple MESOS_STATE_CHANGED before though
        // (with empty data) because of the way the stream is currently modeled.
        this.resolve();
      }, console.error)
    );

    const wait$ = masterRequest$.pipe(zip(mesos$.pipe(take(1))));
    const eventTrigger$ = data$.pipe(
      merge(
        // A lot of DCOS UI rely on the MesosStateStore emitting
        // MESOS_STATE_CHANGE events. After the switch to the stream, we lost this
        // event. To avoid a deeper refactor, we introduced this fake emitter.
        //
        // TODO: https://jira.mesosphere.com/browse/DCOS-18277
        interval(Config.getRefreshRate())
      )
    );

    // Since we introduced the fake event above, we have to guarantee certain
    // refresh limits to the UI. They are:
    //
    // MOST once every (Config.getRefreshRate() * 0.5) ms. due to sampleTime.
    // LEAST once every tick of Config.getRefreshRate() ms in
    // Observable.interval
    //
    // TODO: https://jira.mesosphere.com/browse/DCOS-18277
    this.stream = wait$
      .pipe(
        concat(eventTrigger$),
        sampleTime(Config.getRefreshRate() * 0.5),
        retryWithLinearBackoff()
      )
      .subscribe(
        () => Promise.resolve().then(this.onStreamData),
        this.onStreamError
      );
  }

  getLastMesosState() {
    return {
      executors: [],
      frameworks: [],
      master_info: {},
      slaves: [],
      tasks: [],
      ...this.get("lastMesosState"),
    };
  }

  getMaster() {
    return {
      master_info: {},
      ...this.get("master"),
    };
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

  getNodeFromID(id) {
    const nodes = this.getLastMesosState().slaves;

    if (nodes) {
      return nodes.find((node) => node.id === id);
    }

    return null;
  }

  getNodeFromHostname(hostname) {
    const nodes = this.getLastMesosState().slaves;

    if (nodes) {
      return nodes.find((node) => node.hostname === hostname);
    }

    return null;
  }

  getTasksFromNodeID(nodeID) {
    const { tasks, frameworks } = this.getLastMesosState();

    const servicesMap = MesosStateUtil.getFrameworkToServicesMap(
      frameworks,
      DCOSStore.serviceTree
    );

    return tasks
      .filter(({ slave_id }) => slave_id === nodeID)
      .map((task) =>
        MesosStateUtil.flagSDKTask(task, servicesMap[task.framework_id])
      );
  }

  getTaskFromTaskID(taskID) {
    const { tasks } = this.getLastMesosState();
    const task = tasks.find(({ id }) => id === taskID);

    return task ? new Task(task) : null;
  }

  getFrameworkByTask(task) {
    const { frameworks } = this.getLastMesosState();

    return frameworks.find((framework) => framework.id === task.framework_id);
  }

  getTasksByService(service) {
    const { frameworks, tasks = [] } = this.getLastMesosState();
    const serviceName = service.getName();

    // Convert serviceId to Mesos task id prefix
    const taskIdPrefix = service.getMesosId();

    if (!serviceName || !taskIdPrefix || !frameworks) {
      return [];
    }

    const serviceIsFramework = service && service instanceof Framework;
    const serviceFrameworkName = serviceIsFramework
      ? service.getFrameworkName()
      : serviceName;

    // Combine framework (if matching framework was found) and filtered
    // Marathon tasks. This will give you a list of framework tasks including
    // the scheduler tasks or a list of Marathon application tasks.
    let serviceTasks = [];
    if (serviceIsFramework) {
      const framework = frameworks.find(
        (framework) =>
          framework.active && framework.name === serviceFrameworkName
      );

      if (framework) {
        serviceTasks = tasks.filter(
          (task) => task.framework_id === framework.id
        );
      }
    }

    return tasks
      .filter(
        (task) =>
          task.isStartedByMarathon &&
          task.id.startsWith(`${taskIdPrefix}.instance`)
      )
      .concat(serviceTasks)
      .map((task) => MesosStateUtil.flagSDKTask(task, service));
  }

  getRunningTasksFromVirtualNetworkName(overlayName) {
    return MesosStateUtil.getRunningTasksFromVirtualNetworkName(
      this.getLastMesosState(),
      overlayName
    );
  }

  onStreamData = () => {
    this.emit(MESOS_STATE_CHANGE);
  };

  onStreamError = (error) => {
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
  };

  get storeID() {
    return "state";
  }
}

if (Config.useFixtures) {
  const getMasterFixture = import(
    /* getMasterFixture */ "../../../tests/_fixtures/v1/get_master.json"
  );
  const subscribeFixture = import(
    /* subscribeFixture */ "../../../tests/_fixtures/v1/subscribe"
  );

  const { MesosStreamType } = require("../core/MesosStream");

  Promise.all([getMasterFixture, subscribeFixture]).then((values) => {
    container.rebind(MesosMasterRequestType).toConstantValue(of(values[0]));

    container
      .rebind(MesosStreamType)
      .toConstantValue(of(JSON.stringify(values[1])));
  });
}

export default new MesosStateStore();
