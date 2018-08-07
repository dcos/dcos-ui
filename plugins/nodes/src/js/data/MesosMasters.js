import React from "react";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/retry";
import "rxjs/add/operator/filter";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import LeaderGrid from "../components/LeaderGrid";

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function hostPort(address) {
  return `${address.hostname}:${address.port}`;
}

export function getRegion(master) {
  return (
    findNestedPropertyInObject(master, "domain.fault_domain.region.name") ||
    "N/A"
  );
}

const STORE_POLL_INTERVAL = 2000;

function mesosMasterEmpty() {
  return {
    hostPort: undefined,
    version: undefined,
    electedTime: undefined,
    startTime: undefined,
    region: undefined
  };
}

export function mesosMasterInfo(
  masterDataSource,
  interval = STORE_POLL_INTERVAL
) {
  return Observable.timer(0, interval)
    .map(_ => {
      return masterDataSource();
    })
    .map(mesosState => mesosState.master_info)
    .filter(master => !isEmptyObject(master))
    .map(master => {
      return {
        hostPort: hostPort(master.address),
        version: master.version,
        electedTime: master.elected_time,
        startTime: master.start_time,
        region: getRegion(master)
      };
    });
}

// This is an attempt of the mediator pattern without componentFromStream
export default class MesosMasters extends React.Component {
  constructor() {
    super(...arguments);

    this.state = mesosMasterEmpty();

    const masterDataSource = MesosStateStore.getMaster.bind(MesosStateStore);
    this.stream = mesosMasterInfo(masterDataSource);
  }

  componentDidMount() {
    this.subscription = this.stream.subscribe(this.setState.bind(this));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return <LeaderGrid master={this.state} />;
  }
}
